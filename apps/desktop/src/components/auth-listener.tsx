import { LOCAL_ACCOUNT_ID } from "@blinkdisk/constants/account";
import { useAuthDialog } from "@desktop/hooks/state/use-auth-dialog";
import { useMoveVaultsDialog } from "@desktop/hooks/state/use-move-vaults-dialog";
import { resumeOnboardingAfterAuth } from "@desktop/hooks/state/use-onboarding";
import { useAuth } from "@desktop/hooks/use-auth";
import { completeOnboarding } from "@desktop/hooks/use-onboarding-exit";
import { getVaultCollection } from "@desktop/lib/db";
import {
  isOnboardingActive,
  type OnboardingRecord,
} from "@desktop/lib/onboarding";
import { useNavigate } from "@tanstack/react-router";
import { useCallback, useEffect } from "react";

export function AuthListener() {
  const { setIsOpen: setAuthDialogIsOpen } = useAuthDialog();
  const { openMoveVaultsDialog } = useMoveVaultsDialog();
  const { setAuthenticated, accountChanged } = useAuth();
  const navigate = useNavigate({ from: "/" });

  const onAccountAdd = useCallback(
    async ({ accountId }: { accountId: string }) => {
      setAuthDialogIsOpen(false);

      await setAuthenticated(true);

      const isOnboarding = isOnboardingActive(
        window.electron.store.get("onboarding") as OnboardingRecord | undefined,
      );

      if (isOnboarding) {
        await accountChanged(accountId, { promptVault: false });

        const hasVaults =
          getVaultCollection(accountId).find({ status: "ACTIVE" }).fetch()
            .length > 0;

        if (!hasVaults) {
          resumeOnboardingAfterAuth();
          navigate({
            to: "/onboarding/$accountId",
            params: { accountId },
            replace: true,
          });
          return;
        }

        // Signing in to an account that is already set up ends the setup.
        await completeOnboarding();
      } else {
        await navigate({
          to: "/$accountId/loading",
          params: { accountId },
        });

        await accountChanged(accountId);
      }

      navigate({ to: "/$accountId", params: { accountId } });

      const localVaults = getVaultCollection(LOCAL_ACCOUNT_ID)
        .find({ status: "ACTIVE" })
        .fetch();

      if (localVaults.length) {
        openMoveVaultsDialog({
          allVaults: true,
          toAccountId: accountId,
        });
      }
    },
    [
      setAuthDialogIsOpen,
      setAuthenticated,
      accountChanged,
      navigate,
      openMoveVaultsDialog,
    ],
  );

  useEffect(() => {
    return window.electron.auth.onAccountAdd(onAccountAdd);
  }, [onAccountAdd]);

  return null;
}
