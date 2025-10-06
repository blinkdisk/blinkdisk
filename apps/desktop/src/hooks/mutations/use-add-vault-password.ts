import { useAccountId } from "@desktop/hooks/use-account-id";
import { showErrorToast } from "@desktop/lib/error";
import { ZVaultPasswordFormType } from "@schemas/vault";
import { useMutation, useQueryClient } from "@tanstack/react-query";

export function useAddVaultPassword(onSuccess: () => void) {
  const queryClient = useQueryClient();
  const { accountId } = useAccountId();

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
        queryKey: [accountId, "vault", "status"],
      });

      onSuccess?.();
    },
  });
}
