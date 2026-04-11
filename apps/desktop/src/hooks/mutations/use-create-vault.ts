import { STORAGE_PROVIDERS } from "@blinkdisk/constants/providers";
import {
  DEFAULT_VAULT_OPTIONS,
  LATEST_VAULT_VERSION,
} from "@blinkdisk/constants/vault";
import { ProviderConfig } from "@blinkdisk/schemas/providers";
import { ZCreateVaultType } from "@blinkdisk/schemas/vault";
import { CustomError } from "@blinkdisk/utils/error";
import { showErrorToast } from "@blinkdisk/utils/error-toast";
import { generateId } from "@blinkdisk/utils/id";
import { removeEmptyStrings } from "@blinkdisk/utils/object";
import { tryCatch } from "@blinkdisk/utils/try-catch";
import { useAccountId } from "@desktop/hooks/use-account-id";
import { useLogsnag } from "@desktop/hooks/use-logsnag";
import { useQueryKey } from "@desktop/hooks/use-query-key";
import { getConfigCollection, getVaultCollection } from "@desktop/lib/db";
import { convertPolicyToCore, defaultVaultPolicy } from "@desktop/lib/policy";
import { trpc } from "@desktop/lib/trpc";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { usePostHog } from "posthog-js/react";

export type CreateVaultResponse = {
  vaultId: string;
};

export function useCreateVault(onSuccess: (res: CreateVaultResponse) => void) {
  const queryClient = useQueryClient();
  const posthog = usePostHog();

  const { accountId } = useAccountId();
  const { queryKeys } = useQueryKey();
  const { logsnag } = useLogsnag();

  return useMutation({
    mutationKey: ["vault", "create"],
    mutationFn: async (
      values: Pick<ZCreateVaultType, "name" | "provider"> & {
        password: string;
        config: ProviderConfig;
      },
    ) => {
      const provider = STORAGE_PROVIDERS.find(
        (p) => p.type === values.provider,
      );

      if (!provider) throw new Error("Invalid provider");

      let initialised = false;
      let coreId: string | undefined;
      if (provider.type !== "CLOUDBLINK") {
        const validation = await window.electron.vault.validate({
          type: provider.type,
          config: values.config,
          password: values.password,
        });

        if (validation.code === "INVALID_PASSWORD")
          throw { code: "INVALID_PASSWORD" };

        initialised = !!validation.uniqueID;
        if (validation.uniqueID) coreId = atob(validation.uniqueID);
      }

      if (coreId) {
        const existing = getVaultCollection(accountId).findOne({ coreId });
        if (existing) throw new CustomError("VAULT_ALREADY_EXISTS");
      }

      let vaultId: string;
      let cloudBlinkToken: string | undefined;
      let spaceId: string | undefined;

      if (provider.type === "CLOUDBLINK") {
        const [res, err] = await tryCatch(trpc.cloudblink.initVault.mutate());
        if (err) throw err;

        vaultId = res.vaultId;
        cloudBlinkToken = res.token;
        spaceId = res.spaceId;
      } else {
        vaultId = generateId("Vault");
      }

      const encryptedConfig = await window.electron.vault.config.encrypt({
        password: values.password,
        config: removeEmptyStrings(values.config),
      });

      if (!initialised) {
        const [res, error] = await tryCatch(
          window.electron.vault.create({
            vault: {
              id: vaultId,
              name: values.name,
              provider: provider.type,
              config: values.config,
              options: DEFAULT_VAULT_OPTIONS,
              password: values.password,
              ...(cloudBlinkToken ? { token: cloudBlinkToken } : {}),
            },
            userPolicy: convertPolicyToCore(defaultVaultPolicy),
            globalPolicy: {},
          }),
        );

        if (error || res.error) {
          // Clean up vault if it was created
          if (provider.type === "CLOUDBLINK")
            await tryCatch(trpc.cloudblink.deleteVault.mutate({ vaultId }));

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
            provider: provider.type,
            config: values.config,
            password: values.password,
          }),
        );

        if (error || (res.error && res.error !== "ALREADY_CONNECTED"))
          // CloudBlink clean up not necessary here since
          // these vaults can't be initialised already
          throw error || new Error(res.error?.toString());
      }

      const userName = window.electron.os.userName(vaultId);
      const hostName = window.electron.os.hostName(vaultId);

      getVaultCollection(accountId).insert({
        id: vaultId,
        name: values.name,
        provider: provider.type,
        coreId: coreId || vaultId,
        configLevel: provider.level,
        spaceId,
        status: "ACTIVE",
        options: DEFAULT_VAULT_OPTIONS,
        version: LATEST_VAULT_VERSION,
        createdAt: new Date().toISOString(),
      });

      getConfigCollection(accountId).insert({
        id: generateId("Config"),
        data: encryptedConfig,
        level: provider.level,
        userName,
        hostName,
        vaultId,
        createdAt: new Date().toISOString(),
      });

      await window.electron.vault.password.set({
        vaultId,
        password: values.password,
      });

      logsnag({
        icon: "🔒",
        title: "Vault created",
        description: `(${provider.type}) ${values.name} just got created.`,
        channel: "vaults",
      });

      posthog.capture("vault_create", {
        provider: provider.type,
        name: values.name,
        vaultId,
      });

      return { vaultId };
    },
    onError: showErrorToast,
    onSuccess: async (res) => {
      await queryClient.invalidateQueries({
        queryKey: queryKeys.vault.status(res.vaultId),
      });

      onSuccess?.(res);
    },
  });
}
