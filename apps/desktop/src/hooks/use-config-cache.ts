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
        vaultId: config.vaultId,
        hostName: config.hostName,
        userName: config.userName,
      })),
    });
  }, [accountId, configs, isLoading, setVaults]);
}
