import { ProviderType } from "@config/providers";
import { useQueryKey } from "@desktop/hooks/use-query-key";
import { showErrorToast } from "@desktop/lib/error";
import { trpc } from "@desktop/lib/trpc";
import { ZAddConfigType } from "@schemas/config";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { tryCatch } from "@utils/try-catch";

export function useAddVaultConfig(onSuccess?: () => void) {
  const queryClient = useQueryClient();

  const { queryKeys } = useQueryKey();

  return useMutation({
    mutationKey: ["config", "add"],
    mutationFn: async (
      values: Omit<ZAddConfigType, "config" | "userName" | "hostName"> & {
        config: object;
        name: string;
        provider: ProviderType;
      },
    ) => {
      const password = await window.electron.vault.password.get({
        vaultId: values.vaultId,
      });

      if (!password) throw new Error("PASSWORD_MISSING");

      const [res, error] = await tryCatch(
        window.electron.vault.connect({
          id: values.vaultId,
          name: values.name,
          provider: values.provider,
          config: values.config,
          password: password,
        }),
      );

      if (error || (res.error && res.code !== "ALREADY_CONNECTED"))
        throw error || new Error(res.error?.toString());

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
