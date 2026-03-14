import { useAccountId } from "@desktop/hooks/use-account-id";
import { useMemo } from "react";
import { ProfileFilter } from "./use-profile";

export function useQueryKey() {
  const { accountId } = useAccountId();

  const queryKeys = useMemo(() => {
    const keys = {
      account: {
        all: ["account"],
        list: () => [...keys.account.all, "list"],
        detail: () => [...keys.account.all],
      },
      space: [accountId, "space"],
      vault: {
        all: [accountId, "vault"],
        list: () => [...keys.vault.all, "list"],
        detail: (vaultId?: string) => [...keys.vault.all, vaultId, "details"],
        status: (vaultId?: string) => [...keys.vault.all, vaultId, "status"],
        config: (vaultId?: string, password?: string | null) => [
          ...keys.vault.all,
          vaultId,
          "config",
          password,
        ],
        password: (vaultId?: string) => [
          ...keys.vault.all,
          vaultId,
          "password",
        ],
        throttle: (vaultId?: string) => [
          ...keys.vault.all,
          vaultId,
          "throttle",
        ],
        profiles: (vaultId?: string) => [
          ...keys.vault.all,
          vaultId,
          "profiles",
        ],
      },
      billing: {
        all: [accountId, "billing"],
        detail: () => [...keys.billing.all],
      },
      subscription: {
        all: [accountId, "subscription"],
        detail: () => [...keys.subscription.all],
      },
      config: {
        all: [accountId, "config"],
        list: () => [...keys.config.all, "list"],
      },
      directory: {
        all: ["directory"],
        empty: (directoryPath?: string) => [
          ...keys.directory.all,
          "empty",
          directoryPath,
        ],
        detail: (directoryId?: string) => [...keys.directory.all, directoryId],
        mount: (rootId?: string) => [...keys.directory.all, rootId, "mount"],
      },
      backup: {
        all: [accountId, "backup"],
        list: (folderId?: string) => [...keys.backup.all, "list", folderId],
      },
      folder: {
        all: [accountId, "folder"],
        list: (vaultId: string | undefined, profileFilter: ProfileFilter) => [
          ...keys.folder.all,
          "list",
          vaultId,
          profileFilter,
        ],
        restores: (folderId?: string) => [
          ...keys.folder.all,
          folderId,
          "restores",
        ],
        size: (vaultId?: string, taskId?: string | null) => [
          ...keys.folder.all,
          vaultId,
          "size",
          taskId,
        ],
      },
      policy: {
        all: [accountId, "policy"],
        vault: (vaultId: string | undefined, profileFilter: ProfileFilter) => [
          ...keys.policy.all,
          vaultId,
          profileFilter,
        ],
        folders: () => [...keys.policy.all, "folder"],
        folder: (folderId?: string) => [...keys.policy.folders(), folderId],
      },
      task: {
        all: [accountId, "task"],
        single: (taskId?: string) => [...keys.task.all, taskId],
        logs: (taskId?: string) => [...keys.task.all, taskId, "logs"],
      },
    };

    return keys;
  }, [accountId]);

  return {
    queryKeys,
    accountId,
  };
}
