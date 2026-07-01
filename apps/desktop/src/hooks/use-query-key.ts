import { useAccountId } from "@desktop/hooks/use-account-id";
import type { SelectedProfile } from "@desktop/hooks/use-profile";

export function useQueryKey() {
  const { accountId } = useAccountId();

  const queryKeys = (() => {
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
        list: (sourceId?: string) => [...keys.backup.all, "list", sourceId],
        unfiltered: (vaultId?: string) => [
          ...keys.backup.all,
          "unfiltered",
          vaultId,
        ],
      },
      source: {
        all: [accountId, "source"],
        list: (vaultId: string | undefined, profile: SelectedProfile) => [
          ...keys.source.all,
          "list",
          vaultId,
          profile,
        ],
        restores: (sourceId?: string) => [
          ...keys.source.all,
          sourceId,
          "restores",
        ],
        size: (vaultId?: string, taskId?: string | null) => [
          ...keys.source.all,
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
        sources: () => [...keys.policy.all, "source"],
        source: (sourceId?: string, profile?: SelectedProfile) => [
          ...keys.policy.sources(),
          sourceId,
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
  })();

  return {
    queryKeys,
    accountId,
  };
}
