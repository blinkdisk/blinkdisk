import { useAccountId } from "@desktop/hooks/use-account-id";
import { useMemo } from "react";

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
        detail: (vaultId?: string) => [...keys.vault.all, vaultId],
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
        listByProfile: (profileId?: string) => [
          ...keys.vault.all,
          "list",
          profileId,
        ],
        unlinked: (profileId?: string) => [
          ...keys.vault.all,
          "unlinked",
          profileId,
        ],
        linked: (vaultId?: string) => [...keys.vault.all, vaultId, "linked"],
        throttle: (vaultId?: string) => [
          ...keys.vault.all,
          vaultId,
          "throttle",
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
      device: {
        all: [accountId, "device"],
        list: () => [...keys.device.all, "list"],
        profiles: (deviceId?: string) => [...keys.device.all, "list", deviceId],
      },
      profile: {
        all: [accountId, "profile"],
        list: () => [...keys.profile.all, "list"],
      },
      config: {
        all: [accountId, "config"],
        list: (profileId?: string) => [...keys.config.all, "list", profileId],
      },
      storage: {
        all: [accountId, "storage"],
        list: () => [...keys.storage.all, "list"],
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
        list: (vaultId?: string) => [...keys.folder.all, "list", vaultId],
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
        vault: (vaultId?: string) => [...keys.policy.all, vaultId],
        folders: () => [...keys.policy.all, "folder"],
        folder: (folderId?: string) => [...keys.policy.folders(), folderId],
      },
    };

    return keys;
  }, [accountId]);

  return {
    queryKeys,
    accountId,
  };
}
