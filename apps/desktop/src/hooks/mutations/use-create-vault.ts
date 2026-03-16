import { defaultVaultOptions } from "@blinkdisk/config/vault";
import { ProviderConfig } from "@blinkdisk/schemas/providers";
import { ZCreateVaultType } from "@blinkdisk/schemas/vault";
import { showErrorToast } from "@blinkdisk/utils/error";
import { generateId } from "@blinkdisk/utils/id";
import { tryCatch } from "@blinkdisk/utils/try-catch";
import { useQueryKey } from "@desktop/hooks/use-query-key";
import { convertPolicyToCore, defaultVaultPolicy } from "@desktop/lib/policy";
import { trpc } from "@desktop/lib/trpc";
import { useMutation, useQueryClient } from "@tanstack/react-query";

export type CreateVaultResponse = {
  vaultId: string;
};

export function useCreateVault(onSuccess: (res: CreateVaultResponse) => void) {
  const queryClient = useQueryClient();

  const { queryKeys } = useQueryKey();

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

      const initialised = !!validation.uniqueID;

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
        userName: window.electron.os.userName(vaultId),
        hostName: window.electron.os.hostName(vaultId),
        ...(validation.uniqueID
          ? {
              coreId: atob(validation.uniqueID || ""),
            }
          : {}),
      };

      let created = false;
      if (!initialised) {
        let token: string | null | undefined = null;
        if (values.provider === "CLOUDBLINK") {
          // For CloudBlink, we need to create the vault in the API
          // first to get the token and initialize the durable object.
          const res = await trpc.vault.create.mutate(createOptions);
          token = res.vault.token;
          created = true;
        }

        const [res, error] = await tryCatch(
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

        if (error || res.error) {
          // Clean up vault if it was created
          if (created) await tryCatch(trpc.vault.delete.mutate({ vaultId }));

          throw error || new Error(res.error?.toString());
        }
      } else {
        // Vault already exists, connect to it.
        //
        // This state should not be possible for CloudBlink vaults.
        const [res, error] = await tryCatch(
          window.electron.vault.connect({
            id: vaultId,
            name: values.name,
            provider: values.provider,
            config: values.config,
            password: values.password,
          }),
        );

        if (error || (res.error && res.error !== "ALREADY_CONNECTED")) {
          // Clean up vault if it was created
          if (created) await tryCatch(trpc.vault.delete.mutate({ vaultId }));

          throw error || new Error(res.error?.toString());
        }
      }

      // Vault not created yet, create it (for all but CloudBlink)
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
