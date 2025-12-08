import { useQueryKey } from "@desktop/hooks/use-query-key";
import { EncryptedConfig } from "@electron/encryption";
import { ProviderConfig } from "@schemas/providers";
import { useQuery } from "@tanstack/react-query";

export function useVaultConfig(
  vault?: {
    id: string;
    config: EncryptedConfig | null;
  },
  password?: string | null,
) {
  const { queryKeys } = useQueryKey();

  return useQuery({
    queryKey: queryKeys.vault.config(vault?.id, password),
    queryFn: async () => {
      if (!vault || !password || !vault.config) return null;

      return (await window.electron.vault.config.decrypt({
        password: password!,
        encrypted: vault.config,
      })) as ProviderConfig;
    },
    enabled: !!vault && !!password,
  });
}
