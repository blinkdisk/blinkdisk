import { useAccountId } from "@desktop/hooks/use-account-id";
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
  const { accountId } = useAccountId();

  return useQuery({
    queryKey: [accountId, "vault", vault?.id, "config", password],
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
