import { useQueryKey } from "@desktop/hooks/use-query-key";
import { showErrorToast } from "@desktop/lib/error";
import { trpc } from "@desktop/lib/trpc";
import { ZAddConfigType } from "@schemas/config";
import { useMutation, useQueryClient } from "@tanstack/react-query";

export function useAddVaultConfig(onSuccess?: () => void) {
  const queryClient = useQueryClient();

  const { queryKeys } = useQueryKey();

  return useMutation({
    mutationKey: ["config", "add"],
    mutationFn: async (
      values: Omit<ZAddConfigType, "config" | "userName" | "hostName"> & {
        config: object;
      },
    ) => {
      const password = await window.electron.vault.password.get({
        vaultId: values.vaultId,
      });

      if (!password) throw new Error("PASSWORD_MISSING");

      return await trpc.config.add.mutate({
        ...values,
        userName: window.electron.os.userName(values.vaultId),
        hostName: window.electron.os.hostName(values.vaultId),
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
          queryKey: queryKeys.config.all,
        }),
        queryClient.invalidateQueries({
          queryKey: queryKeys.vault.all,
        }),
      ]);

      onSuccess?.();
    },
  });
}
