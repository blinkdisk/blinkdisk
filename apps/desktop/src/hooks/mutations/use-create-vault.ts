import { useAccountId } from "@desktop/hooks/use-account-id";
import { showErrorToast } from "@desktop/lib/error";
import { trpc } from "@desktop/lib/trpc";
import { useAppTranslation } from "@hooks/use-app-translation";
import { ProviderConfig } from "@schemas/providers";
import { ZCreateVaultType } from "@schemas/vault";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

export type CreateVaultResponse = Awaited<
  ReturnType<typeof trpc.vault.create.mutate>
>;

export function useCreateVault(onSuccess: (res: CreateVaultResponse) => void) {
  const queryClient = useQueryClient();

  const { accountId } = useAccountId();
  const { t } = useAppTranslation("vault.createDialog.success");

  return useMutation({
    mutationKey: ["vault", "create"],
    mutationFn: async (
      values: Omit<ZCreateVaultType, "config" | "passwordHash"> & {
        password: string;
        config: ProviderConfig;
      },
    ) => {
      const payload: ZCreateVaultType & { password?: string } = {
        ...values,
        passwordHash: await window.electron.vault.password.hash({
          password: values.password,
        }),
        config: await window.electron.vault.config.encrypt({
          password: values.password,
          config: values.config,
        }),
      };

      delete payload.password;

      return await trpc.vault.create.mutate(payload);
    },
    onError: showErrorToast,
    onSuccess: async (res, variables) => {
      try {
        const create = await window.electron.vault.create({
          ...res,
          vault: {
            ...res.vault,
            config: variables.config,
            password: variables.password!,
          },
        });

        // TODO: Show these errors in the UI
        if ("error" in create && create.error)
          throw new Error(create.error.toString());
      } catch (e) {
        try {
          await trpc.vault.delete.mutate({
            vaultId: res.vault.id,
          });
        } catch (e) {
          console.error("Failed to delete vault", e);
        }

        throw e;
      }

      await window.electron.vault.password.set({
        storageId: res.storageId,
        password: variables.password,
      });

      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: [accountId, "vault"],
        }),
        queryClient.invalidateQueries({
          queryKey: [accountId, "storage"],
        }),
        queryClient.invalidateQueries({
          queryKey: [accountId, "config"],
        }),
      ]);

      toast.success(t("title"), {
        description: t("description"),
      });

      onSuccess?.(res);
    },
  });
}
