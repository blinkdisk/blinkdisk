import { useAuthDialog } from "@desktop/hooks/state/use-auth-dialog";
import { useAppStorage } from "@desktop/hooks/use-app-storage";
import { useQueryKey } from "@desktop/hooks/use-query-key";
import { useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import { LOCAL_ACCOUNT_ID } from "libs/constants/src/account";
import { usePostHog } from "posthog-js/react";
import { useCallback } from "react";
import { useAccountList } from "./queries/use-account-list";
import { useAccountId } from "./use-account-id";

export function useAuth() {
  const navigate = useNavigate();
  const posthog = usePostHog();
  const queryClient = useQueryClient();

  const { accounts } = useAccountList();
  const { accountId } = useAccountId();
  const { queryKeys } = useQueryKey();
  const { openAuthDialog } = useAuthDialog();

  const [authenticated, setAuthenticated] = useAppStorage(
    "authenticated",
    false,
  );

  const addAccount = useCallback(async () => {
    openAuthDialog();
  }, [openAuthDialog]);

  const accountChanged = useCallback(
    async (accountId: string) => {
      const local = accountId === LOCAL_ACCOUNT_ID;

      if (!local) {
        // End the last session
        posthog.reset();
        // Start a new session
        posthog.identify(accountId);
      }

      await window.electron.store.set("currentAccountId", accountId);

      await queryClient.invalidateQueries({
        queryKey: queryKeys.account.detail(),
      });
    },
    [queryClient, queryKeys, posthog],
  );

  const selectAccount = useCallback(
    async (accountId: string) => {
      navigate({ to: "/{-$accountId}/loading" });

      await accountChanged(accountId);

      navigate({
        to: "/{-$accountId}",
        params: { accountId },
      });
    },
    [accountChanged, navigate],
  );

  const logout = useCallback(async () => {
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
        to: "/{-$accountId}",
        params: { accountId: LOCAL_ACCOUNT_ID },
      });
    }
  }, [navigate, accountId, accounts, selectAccount, setAuthenticated]);

  return {
    logout,
    authenticated,
    setAuthenticated,
    addAccount,
    selectAccount,
    accountChanged,
  };
}
