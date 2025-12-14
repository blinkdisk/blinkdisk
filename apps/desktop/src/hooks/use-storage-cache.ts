import { useStorageList } from "@desktop/hooks/queries/use-storage-list";
import { useAccountId } from "@desktop/hooks/use-account-id";
import { useAppStorage } from "@desktop/hooks/use-app-storage";
import { useEffect } from "react";

export function useStorageCache() {
  const { accountId } = useAccountId();
  const { data: storages, isLoading } = useStorageList();
  const [, setVaults] = useAppStorage("vaults");

  useEffect(() => {
    if (isLoading || !storages || !accountId) return;

    window.electron.storage.cache({
      accountId,
      storages: storages.map((storage) => ({
        id: storage.id,
        version: storage.version,
        configLevel: storage.configLevel,
        provider: storage.provider,
        accountId: storage.accountId,
        options: storage.options,
        token: storage.token,
      })),
    });
  }, [accountId, storages, isLoading, setVaults]);
}
