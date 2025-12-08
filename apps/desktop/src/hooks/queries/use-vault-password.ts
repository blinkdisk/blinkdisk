import { useQueryKey } from "@desktop/hooks/use-query-key";
import { useQuery } from "@tanstack/react-query";

export function useVaultPassword(
  vault?: { id: string; storageId: string } | null,
) {
  const { queryKeys } = useQueryKey();

  return useQuery({
    queryKey: queryKeys.vault.password(vault?.id),
    queryFn: async () => {
      if (!vault) return null;

      return await window.electron.vault.password.get({
        storageId: vault.storageId,
      });
    },
    enabled: !!vault,
  });
}
