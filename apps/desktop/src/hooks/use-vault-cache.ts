import { useVaultList } from "@desktop/hooks/queries/use-vault-list";
import { useAccountId } from "@desktop/hooks/use-account-id";
import { useAppStorage } from "@desktop/hooks/use-app-storage";
import { useEffect } from "react";

export function useVaultCache() {
  const { accountId } = useAccountId();
  const { data: vaults, isLoading } = useVaultList();
  const [, setVaults] = useAppStorage("vaults");

  useEffect(() => {
    if (isLoading || !vaults || !accountId) return;

    window.electron.vault.cache({
      accountId,
      vaults: vaults.map((vault) => ({
        id: vault.id,
        name: vault.name,
        accountId: vault.accountId,
        configLevel: vault.configLevel,
        options: vault.options,
        version: vault.version,
        provider: vault.provider,
        ...(vault.token && { token: vault.token }),
      })),
    });
  }, [accountId, vaults, isLoading, setVaults]);
}
