import { useAccountId } from "@desktop/hooks/use-account-id";
import { useQuery } from "@tanstack/react-query";

export function useVaultPassword(
  vault?: { id: string; storageId: string } | null,
) {
  const { accountId } = useAccountId();

  return useQuery({
    queryKey: [accountId, "vault", vault?.id, "password"],
    queryFn: async () => {
      if (!vault) return null;
      return await window.electron.vault.password.get({
        storageId: vault.storageId,
      });
    },
    enabled: !!vault,
  });
}
