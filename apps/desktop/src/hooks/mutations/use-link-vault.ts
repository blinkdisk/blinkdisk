import { useAccountId } from "@desktop/hooks/use-account-id";
import { useDevice } from "@desktop/hooks/use-device";
import { showErrorToast } from "@desktop/lib/error";
import { trpc } from "@desktop/lib/trpc";
import { useAppTranslation } from "@hooks/use-app-translation";
import { ZLinkVaultType } from "@schemas/vault";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import { toast } from "sonner";

export type LinkVaultResponse = Awaited<
  ReturnType<typeof trpc.vault.link.mutate>
>;

export function useLinkVault(onSuccess?: (res: LinkVaultResponse) => void) {
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const { accountId } = useAccountId();
  const { deviceId } = useDevice();
  const { t } = useAppTranslation("vault.linkDialog.success");

  return useMutation({
    mutationKey: ["vault", "link"],
    mutationFn: async (
      values: Omit<ZLinkVaultType, "config"> & {
        password: string;
        config?: object;
      },
    ) => {
      const payload: ZLinkVaultType & { password?: string } = {
        ...values,
        ...(values.config && {
          config: await window.electron.vault.config.encrypt({
            password: values.password,
            config: values.config,
          }),
        }),
      };
      delete payload.password;

      return await trpc.vault.link.mutate(payload);
    },
    onError: showErrorToast,
    onSuccess: async (res, variables) => {
      await window.electron.vault.password.set({
        storageId: res.storageId,
        password: variables.password,
      });

      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: [accountId, "vault"],
        }),
        queryClient.invalidateQueries({
          queryKey: [accountId, "config"],
        }),
      ]);

      toast.success(t("title"), {
        description: t("description"),
      });

      await navigate({
        to: "/app/{-$deviceId}/{-$profileId}/{-$vaultId}",
        params: {
          profileId: variables.profileId,
          deviceId,
          vaultId: res.vaultId,
        },
      });

      onSuccess?.(res);
    },
  });
}
