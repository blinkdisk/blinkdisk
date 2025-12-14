import { useConfigList } from "@desktop/hooks/queries/use-config-list";
import { useAccountId } from "@desktop/hooks/use-account-id";
import { useAppStorage } from "@desktop/hooks/use-app-storage";
import { useEffect } from "react";

export function useConfigCache() {
  const { accountId } = useAccountId();
  const { data: configs, isLoading } = useConfigList();
  const [, setVaults] = useAppStorage("vaults");

  useEffect(() => {
    if (isLoading || !configs || !accountId) return;

    window.electron.config.cache({
      accountId,
      configs: configs.map((config) => ({
        id: config.id,
        level: config.level,
        data: config.data,
        accountId: config.accountId,
        storageId: config.storageId,
        profileId: config.profileId,
      })),
    });
  }, [accountId, configs, isLoading, setVaults]);
}
