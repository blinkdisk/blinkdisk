import { LOCAL_ACCOUNT_ID } from "@blinkdisk/constants/account";
import { resetOnboarding } from "@desktop/hooks/state/use-onboarding";
import { useAccountId } from "@desktop/hooks/use-account-id";
import { useVaultId } from "@desktop/hooks/use-vault-id";
import { useNavigate } from "@tanstack/react-router";
import { usePostHog } from "posthog-js/react";
import { useCallback } from "react";

export async function completeOnboarding() {
  await window.electron.store.set(
    "onboarding.completedAt",
    new Date().toISOString(),
  );
}

export function useOnboardingExit() {
  const navigate = useNavigate();
  const posthog = usePostHog();
  const { accountId, isLocalAccount } = useAccountId();
  const { vaultId } = useVaultId();

  const exitOnboarding = useCallback(
    async (outcome: "completed" | "skipped", properties?: object) => {
      const targetAccountId = accountId || LOCAL_ACCOUNT_ID;

      posthog.capture(`onboarding_${outcome}`, properties);

      await completeOnboarding();

      if (isLocalAccount !== false) {
        await window.electron.store.set("hasSkippedAuth", true);
        await window.electron.store.set("currentAccountId", LOCAL_ACCOUNT_ID);
      }

      await navigate(
        vaultId
          ? {
              to: "/$accountId/$vaultId",
              params: { accountId: targetAccountId, vaultId },
              replace: true,
            }
          : {
              to: "/$accountId",
              params: { accountId: targetAccountId },
              replace: true,
            },
      );

      resetOnboarding();
    },
    [accountId, isLocalAccount, vaultId, navigate, posthog],
  );

  return { exitOnboarding };
}
