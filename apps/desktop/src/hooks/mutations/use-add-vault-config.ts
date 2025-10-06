import { useAccountId } from "@desktop/hooks/use-account-id";
import { showErrorToast } from "@desktop/lib/error";
import { trpc } from "@desktop/lib/trpc";
import { ZAddConfigType } from "@schemas/config";
import { useMutation, useQueryClient } from "@tanstack/react-query";

export function useAddVaultConfig(onSuccess?: () => void) {
  const queryClient = useQueryClient();
  const { accountId } = useAccountId();

  return useMutation({
    mutationKey: ["config", "add"],
    mutationFn: async (
      values: Omit<ZAddConfigType, "config"> & { config: object },
    ) => {
      const password = await window.electron.vault.password.get({
        storageId: values.storageId,
      });

      if (!password) throw new Error("PASSWORD_MISSING");

      return await trpc.config.add.mutate({
        ...values,
        config: await window.electron.vault.config.encrypt({
          password: password,
          config: values.config,
        }),
      });
    },
    onError: showErrorToast,
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: [accountId, "config"],
        }),
        queryClient.invalidateQueries({
          queryKey: [accountId, "vault", "status"],
        }),
      ]);

      onSuccess?.();
    },
  });
}
