import { useQueryKey } from "@desktop/hooks/use-query-key";
import { showErrorToast } from "@desktop/lib/error";
import { ZVaultPasswordFormType } from "@schemas/vault";
import { useMutation, useQueryClient } from "@tanstack/react-query";

export function useAddVaultPassword(onSuccess: () => void) {
  const queryClient = useQueryClient();
  const { queryKeys } = useQueryKey();

  return useMutation({
    mutationKey: ["vault", "password", "add"],
    mutationFn: async (
      values: ZVaultPasswordFormType & { storageId: string },
    ) => {
      return await window.electron.vault.password.set({
        storageId: values.storageId,
        password: values.password,
      });
    },
    onError: showErrorToast,
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: queryKeys.vault.all,
      });

      onSuccess?.();
    },
  });
}
