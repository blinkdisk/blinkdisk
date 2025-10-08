import { useAccountId } from "@desktop/hooks/use-account-id";
import { useDevice } from "@desktop/hooks/use-device";
import { showErrorToast } from "@desktop/lib/error";
import {
  convertPolicyToCore,
  CorePolicy,
  defaultPolicy,
} from "@desktop/lib/policy";
import { trpc } from "@desktop/lib/trpc";
import { useAppTranslation } from "@hooks/use-app-translation";
import { ZLinkVaultType } from "@schemas/vault";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import { tryCatch } from "@utils/try-catch";
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
        deviceId: string;
        source: {
          profileId: string;
          deviceId: string;
        };
      },
    ) => {
      const payload: ZLinkVaultType = {
        profileId: values.profileId,
        storageId: values.storageId,
        name: values.name,
        ...(values.config && {
          config: await window.electron.vault.config.encrypt({
            password: values.password,
            config: values.config,
          }),
        }),
      };

      return await trpc.vault.link.mutate(payload);
    },
    onError: showErrorToast,
    onSuccess: async (res, variables) => {
      await window.electron.vault.password.set({
        storageId: res.storageId,
        password: variables.password,
      });

      // Make sure config is fetched before vault
      await queryClient.invalidateQueries({
        queryKey: [accountId, "config"],
      });

      await queryClient.invalidateQueries({
        queryKey: [accountId, "vault"],
      });

      for (let i = 0; i < 30; i++) {
        await new Promise((res) => setTimeout(res, 1000));

        const status = await window.electron.vault.status({
          vaultId: res.vaultId,
        });

        if (status !== "RUNNING") continue;

        const [policy] = await tryCatch(
          window.electron.vault.fetch({
            vaultId: res.vaultId,
            method: "GET",
            path: "/api/v1/policy",
            search: {
              userName: variables.source.profileId,
              host: variables.source.deviceId,
            },
            data: convertPolicyToCore(defaultPolicy, "VAULT"),
          }) as Promise<CorePolicy & { error?: string }>,
        );

        await tryCatch(
          window.electron.vault.fetch({
            vaultId: res.vaultId,
            method: "PUT",
            path: "/api/v1/policy",
            search: {
              userName: variables.profileId,
              host: variables.deviceId,
            },
            data:
              policy && !policy.error
                ? policy
                : convertPolicyToCore(defaultPolicy, "VAULT"),
          }),
        );

        break;
      }

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
