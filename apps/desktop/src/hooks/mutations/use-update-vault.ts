import { useQueryKey } from "@desktop/hooks/use-query-key";
import { useVaultId } from "@desktop/hooks/use-vault-id";
import { showErrorToast } from "@desktop/lib/error";
import { trpc } from "@desktop/lib/trpc";
import { vaultApi } from "@desktop/lib/vault";
import { ZUpdateVaultFormType } from "@schemas/vault";
import { useMutation, useQueryClient } from "@tanstack/react-query";

export function useUpdateVault(onSuccess: () => void) {
  const queryClient = useQueryClient();
  const { vaultId } = useVaultId();
  const { queryKeys } = useQueryKey();

  return useMutation({
    mutationKey: ["vault", vaultId, "name"],
    mutationFn: async (values: ZUpdateVaultFormType) => {
      const res = await vaultApi(vaultId).post<{ error?: string }>(
        "/api/v1/repo/description",
        {
          description: values.name,
        },
      );

      if (res.data.error) throw new Error(res.data.error);

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
