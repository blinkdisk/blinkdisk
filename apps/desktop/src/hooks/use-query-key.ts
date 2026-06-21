import { useAccountId } from "@desktop/hooks/use-account-id";
import type { SelectedProfile } from "@desktop/hooks/use-profile";
import { useMemo } from "react";

export function useQueryKey() {
  const { accountId } = useAccountId();

  const queryKeys = useMemo(() => {
    const keys = {
      account: {
        all: ["account"],
        detail: (accountId?: string) => [...keys.account.all, accountId],
      },
      space: [accountId, "space"],
      vault: {
        all: [accountId, "vault"],
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
        devices: (vaultId?: string) => [...keys.vault.all, vaultId, "devices"],
      },
      billing: {
        all: [accountId, "billing"],
        detail: () => [...keys.billing.all],
      },
      subscription: {
        all: [accountId, "subscription"],
        detail: () => [...keys.subscription.all],
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
        unfiltered: (vaultId?: string) => [
          ...keys.backup.all,
          "unfiltered",
          vaultId,
        ],
      },
      folder: {
        all: [accountId, "folder"],
        list: (vaultId: string | undefined, profile: SelectedProfile) => [
          ...keys.folder.all,
          "list",
          vaultId,
          profile,
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
        target: (vaultId: string | undefined, targetId: string) => [
          ...keys.policy.all,
          "target",
          vaultId,
          targetId,
        ],
        tree: (vaultId: string | undefined) => [
          ...keys.policy.all,
          "tree",
          vaultId,
        ],
        vault: (vaultId: string | undefined, profile: SelectedProfile) => [
          ...keys.policy.all,
          vaultId,
          profile,
        ],
        folders: () => [...keys.policy.all, "folder"],
        folder: (folderId?: string, profile?: SelectedProfile) => [
          ...keys.policy.folders(),
          folderId,
          profile,
        ],
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
