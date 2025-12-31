import { useQueryKey } from "@desktop/hooks/use-query-key";
import { trpc } from "@desktop/lib/trpc";
import { useQuery } from "@tanstack/react-query";

export type LinkedVaultItem = Awaited<
  ReturnType<typeof trpc.vault.listLinked.query>
>[number];

export function useLinkedVaults(vaultId?: string) {
  const { queryKeys, accountId } = useQueryKey();

  return useQuery({
    queryKey: queryKeys.vault.linked(vaultId),
    queryFn: () => {
      return trpc.vault.listLinked.query({
        vaultId: vaultId!,
      });
    },
    enabled: !!accountId && !!vaultId,
  });
}
