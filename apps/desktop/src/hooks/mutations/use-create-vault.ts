import { defaultVaultOptions } from "@config/vault";
import { useProfile } from "@desktop/hooks/use-profile";
import { useQueryKey } from "@desktop/hooks/use-query-key";
import { showErrorToast } from "@desktop/lib/error";
import { convertPolicyToCore, defaultVaultPolicy } from "@desktop/lib/policy";
import { trpc } from "@desktop/lib/trpc";
import { ProviderConfig } from "@schemas/providers";
import { ZCreateVaultType } from "@schemas/vault";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { generateId } from "@utils/id";
import { tryCatch } from "@utils/try-catch";

export type CreateVaultResponse = {
  vaultId: string;
};

export function useCreateVault(onSuccess: (res: CreateVaultResponse) => void) {
  const queryClient = useQueryClient();

  const { queryKeys } = useQueryKey();
  const { localUserName, localHostName } = useProfile();

  return useMutation({
    mutationKey: ["vault", "create"],
    mutationFn: async (
      values: Pick<ZCreateVaultType, "name" | "provider"> & {
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

      const encryptedConfig = await window.electron.vault.config.encrypt({
        password: values.password,
        config: values.config,
      });

      const vaultId = generateId("Vault");

      const createOptions = {
        id: vaultId,
        name: values.name,
        provider: values.provider,
        config: encryptedConfig,
        userName: localUserName,
        hostName: localHostName,
        ...(validation.uniqueID
          ? {
              coreId: atob(validation.uniqueID || ""),
            }
          : {}),
      };

      let created = false;
      if (!validation.uniqueID) {
        let token: string | null | undefined = null;
        if (values.provider === "BLINKDISK_CLOUD") {
          // For BlinkDisk Cloud, we need to create the vault in the API
          // first to get the token and initialize the durable object.
          const res = await trpc.vault.create.mutate(createOptions);
          token = res.vault.token;
          created = true;
        }

        const [res, err] = await tryCatch(
          window.electron.vault.create({
            vault: {
              id: vaultId,
              name: values.name,
              provider: values.provider,
              config: values.config,
              options: defaultVaultOptions,
              password: values.password,
              ...(token ? { token } : {}),
            },
            userPolicy: convertPolicyToCore(defaultVaultPolicy),
            globalPolicy: {},
          }),
        );

        if (err || res.error) {
          // Clean up vault if it was created
          if (created) await tryCatch(trpc.vault.delete.mutate({ vaultId }));

          throw err || new Error(res.error?.toString());
        }
      }

      // Vault not created yet, create it (for all but BlinkDisk Cloud)
      if (!created) await trpc.vault.create.mutate(createOptions);

      await window.electron.vault.password.set({
        vaultId,
        password: values.password,
      });

      return { vaultId };
    },
    onError: showErrorToast,
    onSuccess: async (res) => {
      await queryClient.invalidateQueries({
        queryKey: queryKeys.config.all,
      });

      await queryClient.invalidateQueries({
        queryKey: queryKeys.vault.all,
      });

      onSuccess?.(res);
    },
  });
}
