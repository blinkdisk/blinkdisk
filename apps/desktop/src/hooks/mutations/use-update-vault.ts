import { useQueryKey } from "#hooks/use-query-key";
import { useVaultId } from "#hooks/use-vault-id";
import { showErrorToast } from "#lib/error";
import { trpc } from "#lib/trpc";
import { vaultApi } from "#lib/vault";
import { ZUpdateVaultFormType } from "@schemas/vault";
import { useMutation, useQueryClient } from "@tanstack/react-query";

export function useUpdateVault(onSuccess: () => void) {
  const queryClient = useQueryClient();
  const { vaultId } = useVaultId();
  const { queryKeys } = useQueryKey();

  return useMutation({
    mutationKey: ["vault", vaultId, "name"],
    mutationFn: async (values: ZUpdateVaultFormType) => {
      await vaultApi(vaultId).post("/api/v1/repo/description", {
        description: values.name,
      });

      const data = await trpc.vault.update.mutate({
        vaultId: vaultId!,
        name: values.name,
      });

      return data;
    },
    onError: showErrorToast,
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: queryKeys.vault.detail(vaultId),
        }),
        queryClient.invalidateQueries({
          queryKey: queryKeys.vault.list(),
        }),
      ]);

      onSuccess?.();
    },
  });
}
