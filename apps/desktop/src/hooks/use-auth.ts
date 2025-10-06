import { useCreateProfile } from "@desktop/hooks/mutations/use-create-profile";
import { useAccount } from "@desktop/hooks/queries/use-account";
import { useAccountList } from "@desktop/hooks/queries/use-account-list";
import { useAccountId } from "@desktop/hooks/use-account-id";
import { authClient } from "@desktop/lib/auth";
import { useAppStorage } from "@hooks/use-app-storage";
import { useAppTranslation } from "@hooks/use-app-translation";
import { useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import { useCallback } from "react";
import { toast } from "sonner";

export function useAuth() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { t } = useAppTranslation("auth");

  const [authenticated, setAuthenticated] = useAppStorage(
    "authenticated",
    false,
  );

  const { setAccountId } = useAccountId();
  const { mutateAsync: createProfile } = useCreateProfile();

  const { data: accounts } = useAccountList({
    enabled: authenticated,
  });

  const { data: account } = useAccount({
    enabled: authenticated,
  });

  const addAccount = useCallback(async () => {
    navigate({ to: "/auth/login" });
  }, [navigate]);

  const accountChanged = useCallback(
    async (
      session?: Awaited<ReturnType<typeof authClient.getSession>>["data"],
    ) => {
      if (!session) {
        const { data, error } = await authClient.getSession();
        if (error || !data) return;
        session = data;
      }

      const deviceId = await window.electron.store.get(
        `accounts.${session?.user.id}.deviceId`,
      );

      const profileId = await window.electron.store.get(
        `accounts.${session?.user.id}.profileId`,
      );

      if (!deviceId || !profileId) {
        const res = await createProfile({
          hostName: await window.electron.os.hostName(),
          machineId: await window.electron.os.machineId(),
          userName: await window.electron.os.userName(),
        });

        await window.electron.store.set(
          `accounts.${session?.user.id}.deviceId`,
          res.deviceId,
        );

        await window.electron.store.set(
          `accounts.${session?.user.id}.profileId`,
          res.profileId,
        );
      }

      await window.electron.store.set(
        `accounts.${session?.user.id}.active`,
        true,
      );

      await setAccountId(session.user.id);

      await queryClient.invalidateQueries({
        queryKey: ["account"],
      });
    },
    [queryClient, setAccountId, createProfile],
  );

  const selectAccount = useCallback(
    async (sessionToken: string, email: string) => {
      const promise = async () => {
        const { data, error } = await authClient.multiSession.setActive({
          sessionToken,
        });

        if (error || !data) throw error;

        navigate({ to: "/app/loading" });
        await accountChanged(data);
        navigate({ to: "/app" });
      };

      toast.promise(promise(), {
        loading: t("switch.toast.loading.title"),
        description: t("switch.toast.loading.description"),
        success: () => ({
          message: t("switch.toast.success.title"),
          description: t("switch.toast.success.description", {
            email: email,
          }),
        }),
        error: () => ({
          message: t("switch.toast.error.title"),
          description: t("switch.toast.error.description", {
            email: email,
          }),
        }),
      });
    },
    [accountChanged, navigate, t],
  );

  const logout = useCallback(async () => {
    if (account) {
      await authClient.multiSession.revoke({
        sessionToken: account?.session.token,
      });

      await window.electron.store.set(
        `accounts.${account?.user.id}.active`,
        false,
      );
    }

    const remainingSessions = accounts?.filter(
      (s) => s.session.id !== account?.session.id,
    );

    if (remainingSessions?.length && remainingSessions[0]) {
      selectAccount(
        remainingSessions[0].session.token,
        remainingSessions[0].user.email,
      );
    } else {
      setAuthenticated(false);
      navigate({ to: "/auth/login" });
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
