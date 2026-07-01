import { LOCAL_ACCOUNT_ID } from "@blinkdisk/constants/account";
import { useAccountList } from "@desktop/hooks/queries/use-account-list";
import { useAuthDialog } from "@desktop/hooks/state/use-auth-dialog";
import { useCreateVaultDialog } from "@desktop/hooks/state/use-create-vault-dialog";
import { useAccountId } from "@desktop/hooks/use-account-id";
import { useAppStorage } from "@desktop/hooks/use-app-storage";
import { useQueryKey } from "@desktop/hooks/use-query-key";
import { getVaultCollection } from "@desktop/lib/db";
import { useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import { usePostHog } from "posthog-js/react";

export function useAuth() {
  const navigate = useNavigate({ from: "/$accountId" });
  const posthog = usePostHog();
  const queryClient = useQueryClient();

  const { accounts } = useAccountList();
  const { accountId } = useAccountId();
  const { queryKeys } = useQueryKey();
  const { openAuthDialog } = useAuthDialog();
  const { openCreateVault } = useCreateVaultDialog();

  const [authenticated, setAuthenticated] = useAppStorage(
    "authenticated",
    false,
  );

  const addAccount = async () => {
    openAuthDialog();
  };

  const accountChanged = async (accountId: string) => {
    const local = accountId === LOCAL_ACCOUNT_ID;

    if (!local) {
      // End the last session
      posthog.reset();
      // Start a new session
      posthog.identify(accountId);
    }

    await Promise.all([
      window.electron.store.set("currentAccountId", accountId),
      queryClient.invalidateQueries({
        queryKey: queryKeys.account.detail(),
      }),
    ]);

    const vaultCollection = getVaultCollection(accountId);
    await vaultCollection.isReady();

    const hasActiveVaults = vaultCollection
      .find({ status: "ACTIVE" })
      .fetch().length;

    if (!local && !hasActiveVaults) {
      openCreateVault({
        step: "DETAILS",
        provider: "CLOUDBLINK",
        autoSelectedProvider: true,
      });
    }
  };

  const selectAccount = async (accountId: string) => {
    navigate({
      to: "/$accountId/loading",
      params: { accountId },
    });

    await accountChanged(accountId);

    navigate({
      to: "/$accountId",
      params: { accountId },
    });
  };

  const logout = async () => {
    const nextAccountId = accountId || LOCAL_ACCOUNT_ID;

    await navigate({
      to: "/$accountId/loading",
      params: { accountId: nextAccountId },
    });

    if (accountId) await window.electron.auth.logout(accountId);

    const remainingSessions = accounts.filter(
      (account) => account.id !== accountId,
    );

    if (remainingSessions?.length && remainingSessions[0]) {
      selectAccount(remainingSessions[0].id);
    } else {
      await window.electron.store.set("currentAccountId", null);
      setAuthenticated(false);

      navigate({
        to: "/$accountId",
        params: { accountId: LOCAL_ACCOUNT_ID },
      });
    }
  };

  return {
    logout,
    authenticated,
    setAuthenticated,
    addAccount,
    selectAccount,
    accountChanged,
  };
}
