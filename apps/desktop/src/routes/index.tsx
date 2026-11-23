import { LOCAL_ACCOUNT_ID } from "@blinkdisk/constants/account";
import type { AccountStorageType } from "@blinkdisk/electron/store";
import { getVaultCollection } from "@desktop/lib/db";
import {
  type OnboardingRecord,
  shouldShowOnboarding,
} from "@desktop/lib/onboarding";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { usePostHog } from "posthog-js/react";
import { useEffect } from "react";

export const Route = createFileRoute("/")({
  component: RouteComponent,
});

function RouteComponent() {
  const navigate = useNavigate({ from: "/" });
  const posthog = usePostHog();

  useEffect(() => {
    const accountId =
      (window.electron.store.get("currentAccountId") as
        | string
        | undefined
        | null) || LOCAL_ACCOUNT_ID;

    async function redirect() {
      const hasSkippedAuth = window.electron.store.get("hasSkippedAuth") as
        | boolean
        | undefined;

      const accounts = window.electron.store.get(
        // @ts-expect-error accounts key does not exist
        "accounts",
      ) as Record<string, AccountStorageType>;

      const hasOnlineAccount = Object.entries(accounts || {}).some(
        ([accountId, account]) =>
          accountId !== LOCAL_ACCOUNT_ID &&
          (account as unknown as AccountStorageType)?.active,
      );

      const hasLocalVaults =
        getVaultCollection(LOCAL_ACCOUNT_ID).find().fetch().length > 0;

      const onboarding = window.electron.store.get("onboarding") as
        | OnboardingRecord
        | undefined;

      if (
        shouldShowOnboarding({
          record: onboarding,
          hasOnlineAccount,
          hasLocalVaults,
          hasSkippedAuth: !!hasSkippedAuth,
        })
      ) {
        if (!onboarding?.startedAt) {
          await window.electron.store.set(
            "onboarding.startedAt",
            new Date().toISOString(),
          );
          posthog.capture("onboarding_started");
        }

        const vaults = getVaultCollection(accountId);
        await vaults.isReady();

        const vaultId = onboarding?.vaultId;
        const hasVault =
          !!vaultId && !!vaults.findOne({ id: vaultId, status: "ACTIVE" });

        if (vaultId && hasVault)
          return navigate({
            to: "/onboarding/$accountId/$vaultId",
            params: { accountId, vaultId },
            replace: true,
          });

        return navigate({
          to: "/onboarding/$accountId",
          params: { accountId },
          replace: true,
        });
      }

      if (!hasOnlineAccount && !hasLocalVaults && !hasSkippedAuth)
        return navigate({
          to: "/welcome",
          replace: true,
        });

      return navigate({
        to: "/$accountId",
        params: { accountId },
        replace: true,
      });
    }

    // A failed lookup must not leave the window blank; the app still works.
    void redirect().catch((error: unknown) => {
      posthog.captureException(error);
      return navigate({
        to: "/$accountId",
        params: { accountId },
        replace: true,
      });
    });
  }, [navigate, posthog]);

  return null;
}
