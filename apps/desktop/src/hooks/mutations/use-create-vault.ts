import { useProfile } from "@desktop/hooks/use-profile";
import { useQueryKey } from "@desktop/hooks/use-query-key";
import { showErrorToast } from "@desktop/lib/error";
import { convertPolicyToCore, defaultVaultPolicy } from "@desktop/lib/policy";
import { trpc } from "@desktop/lib/trpc";
import { ProviderConfig } from "@schemas/providers";
import { ZCreateVaultType } from "@schemas/vault";
import { useMutation, useQueryClient } from "@tanstack/react-query";

export type CreateVaultResponse = Awaited<
  ReturnType<typeof trpc.vault.create.mutate>
>;

export function useCreateVault(onSuccess: (res: CreateVaultResponse) => void) {
  const queryClient = useQueryClient();

  const { queryKeys } = useQueryKey();
  const { localUserName, localHostName } = useProfile();

  return useMutation({
    mutationKey: ["vault", "create"],
    mutationFn: async (
      values: Omit<
        ZCreateVaultType,
        "config" | "userName" | "hostName" | "coreId"
      > & {
        password: string;
        config: ProviderConfig;
      },
    ) => {
      const validation = await window.electron.vault.validate({
        type: values.provider,
        config: values.config,
        password: values.password,
      });

      if (validation.code === "INVALID_PASSWORD")
        throw { code: "INVALID_PASSWORD" };

      const payload: Omit<ZCreateVaultType, "userName" | "hostName"> & {
        password?: string;
      } = {
        ...values,
        ...(validation.uniqueID
          ? {
              coreId: atob(validation.uniqueID || ""),
            }
          : {}),
        config: await window.electron.vault.config.encrypt({
          password: values.password,
          config: values.config,
        }),
      };

      delete payload.password;

      const res = await trpc.vault.create.mutate({
        ...payload,
        userName: localUserName,
        hostName: localHostName,
      });

      return {
        ...res,
        initialized: !!validation.uniqueID,
      };
    },
    onError: showErrorToast,
    onSuccess: async (res, variables) => {
      if (!res.initialized) {
        try {
          const create = await window.electron.vault.create({
            ...res,
            vault: {
              ...res.vault,
              config: variables.config,
              password: variables.password!,
            },
            userPolicy: convertPolicyToCore(defaultVaultPolicy),
            globalPolicy: {},
          });

          // TODO: Show these errors in the UI
          if (create.error) throw new Error(create.error.toString());
        } catch (e) {
          try {
            await trpc.vault.deleteHard.mutate({
              vaultId: res.vault.id,
            });
          } catch (e) {
            console.error("Failed to delete vault", e);
          }

          throw e;
        }
      }

      await window.electron.vault.password.set({
        vaultId: res.vault.id,
        password: variables.password,
      });

      // Make sure configs are fetched before vault
      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: queryKeys.config.all,
        }),
      ]);

      await queryClient.invalidateQueries({
        queryKey: queryKeys.vault.all,
      });

      onSuccess?.(res);
    },
  });
}
