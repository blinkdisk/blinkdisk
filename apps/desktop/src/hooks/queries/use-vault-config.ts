import { useConfigList } from "@desktop/hooks/queries/use-config-list";
import { useVault } from "@desktop/hooks/queries/use-vault";
import { useVaultPassword } from "@desktop/hooks/queries/use-vault-password";
import { useQueryKey } from "@desktop/hooks/use-query-key";
import { ProviderConfig } from "@schemas/providers";
import { useQuery } from "@tanstack/react-query";

export function useVaultConfig() {
  const { queryKeys } = useQueryKey();

  const { data: vault } = useVault();
  const { data: configs } = useConfigList();
  const { data: password } = useVaultPassword(vault);

  return useQuery({
    queryKey: queryKeys.vault.config(vault?.id, password),
    queryFn: async () => {
      if (!vault || !password || !configs) return null;

      if (!vault || !configs || !password) return null;

      const localHostName = window.electron.os.hostName(vault.id);
      const localUserName = window.electron.os.userName(vault.id);

      const config = configs.find((config) =>
        vault.configLevel === "VAULT"
          ? config.level === "VAULT" && config.vaultId === vault.id
          : config.level === "PROFILE" &&
            config.vaultId === vault.id &&
            config.hostName === localHostName &&
            config.userName === localUserName,
      );

      if (!config) return null;

      return (await window.electron.vault.config.decrypt({
        password: password!,
        encrypted: config.data,
      })) as ProviderConfig;
    },
    enabled: !!vault && !!configs && !!password,
  });
}
