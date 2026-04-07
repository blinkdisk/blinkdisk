import type { getSession } from "@blinkdisk/electron/auth";
import { useAccount } from "@desktop/hooks/queries/use-account";
import { useAuthDialog } from "@desktop/hooks/state/use-auth-dialog";
import { useAppStorage } from "@desktop/hooks/use-app-storage";
import { useQueryKey } from "@desktop/hooks/use-query-key";
import { useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import { LOCAL_ACCOUNT_ID } from "libs/constants/src/account";
import { usePostHog } from "posthog-js/react";
import { useCallback } from "react";

export function useAuth() {
  const navigate = useNavigate();
  const posthog = usePostHog();
  const queryClient = useQueryClient();
  const { queryKeys } = useQueryKey();
  const { openAuthDialog } = useAuthDialog();

  const [authenticated, setAuthenticated] = useAppStorage(
    "authenticated",
    false,
  );

  const { data: account } = useAccount({
    enabled: authenticated,
  });

  const addAccount = useCallback(async () => {
    openAuthDialog();
  }, [openAuthDialog]);

  const accountChanged = useCallback(
    async (
      local: boolean,
      session?: Awaited<ReturnType<typeof getSession>>["data"],
    ) => {
      if (!local && !session) {
        const { data, error } = await window.electron.auth.session.get();
        if (error || !data) return;
        session = data;
      }

      if (!local && !session) throw new Error("Failed to get session");

      if (!local) {
        await window.electron.store.set(
          `accounts.${session?.user.id}.active`,
          true,
        );

        // We need to make sure all vaults are started,
        // maybe the account was inactive.
        await window.electron.vault.start.all();

        // End the last session
        posthog.reset();
        // Start a new session
        posthog.identify(session!.user.id);
      }

      await window.electron.store.set(
        "currentAccountId",
        local ? LOCAL_ACCOUNT_ID : session!.user.id,
      );

      await queryClient.invalidateQueries({
        queryKey: queryKeys.account.detail(),
      });

      return session;
    },
    [queryClient, queryKeys, posthog],
  );

  const selectAccount = useCallback(
    async (sessionToken: string) => {
      if (sessionToken !== LOCAL_ACCOUNT_ID) {
        const { data, error } = await window.electron.auth.session.set({
          sessionToken,
        });

        if (error || !data) throw error;

        navigate({ to: "/{-$accountId}/loading" });

        const session = await accountChanged(false, data);
        if (!session) return;

        navigate({
          to: "/{-$accountId}",
          params: { accountId: session.user.id },
        });
      } else {
        await accountChanged(true);

        navigate({
          to: "/{-$accountId}",
          params: { accountId: LOCAL_ACCOUNT_ID },
        });
      }
    },
    [accountChanged, navigate],
  );

  const logout = useCallback(async () => {
    if (account) {
      await window.electron.auth.logout();

      await window.electron.store.set(
        `accounts.${account?.user.id}.active`,
        false,
      );
    }

    const { data: remainingSessions } =
      await window.electron.auth.session.list();

    if (remainingSessions?.length && remainingSessions[0]) {
      selectAccount(remainingSessions[0].session.token);
    } else {
      await window.electron.store.set("currentAccountId", null);
      setAuthenticated(false);

      navigate({
        to: "/{-$accountId}",
        params: { accountId: LOCAL_ACCOUNT_ID },
      });
    }
  }, [navigate, account, selectAccount, setAuthenticated]);

  return {
    logout,
    authenticated,
    setAuthenticated,
    addAccount,
    selectAccount,
    accountChanged,
  };
}
