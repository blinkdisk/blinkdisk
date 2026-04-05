import type { getSession } from "@blinkdisk/electron/auth";
import { useAccount } from "@desktop/hooks/queries/use-account";
import { useAccountList } from "@desktop/hooks/queries/use-account-list";
import { useAppStorage } from "@desktop/hooks/use-app-storage";
import { useQueryKey } from "@desktop/hooks/use-query-key";
import { useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import { usePostHog } from "posthog-js/react";
import { useCallback } from "react";

export function useAuth() {
  const navigate = useNavigate();
  const posthog = usePostHog();
  const queryClient = useQueryClient();
  const { queryKeys } = useQueryKey();

  const [authenticated, setAuthenticated] = useAppStorage(
    "authenticated",
    false,
  );

  const { data: accounts } = useAccountList({
    enabled: authenticated,
  });

  const { data: account } = useAccount({
    enabled: authenticated,
  });

  const addAccount = useCallback(async () => {
    navigate({ to: "/auth" });
  }, [navigate]);

  const accountChanged = useCallback(
    async (session?: Awaited<ReturnType<typeof getSession>>["data"]) => {
      if (!session) {
        const { data, error } = await window.electron.auth.session.get();
        if (error || !data) return;
        session = data;
      }

      if (!session) throw new Error("Failed to get session");

      await window.electron.store.set(
        `accounts.${session?.user.id}.active`,
        true,
      );

      // We need to make sure all vaults are started,
      // maybe the account was inactive.
      await window.electron.vault.start.all();

      await window.electron.store.set("currentAccountId", session.user.id);

      await queryClient.invalidateQueries({
        queryKey: queryKeys.account.detail(),
      });

      // End the last session
      posthog.reset();
      // Start a new session
      posthog.identify(session.user.id);

      return session;
    },
    [queryClient, queryKeys, posthog],
  );

  const selectAccount = useCallback(
    async (sessionToken: string) => {
      const { data, error } = await window.electron.auth.session.set({
        sessionToken,
      });

      if (error || !data) throw error;

      navigate({ to: "/{-$accountId}/loading" });

      const session = await accountChanged(data);
      if (!session) return;

      navigate({
        to: "/{-$accountId}",
        params: { accountId: session.user.id },
      });
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

    const remainingSessions = accounts?.filter(
      (s) => s.session.id !== account?.session.id,
    );

    if (remainingSessions?.length && remainingSessions[0]) {
      selectAccount(remainingSessions[0].session.token);
    } else {
      await window.electron.store.set("currentAccountId", null);
      setAuthenticated(false);
      navigate({ to: "/auth" });
    }
  }, [navigate, account, accounts, selectAccount, setAuthenticated]);

  return {
    logout,
    authenticated,
    setAuthenticated,
    addAccount,
    selectAccount,
    accountChanged,
  };
}
