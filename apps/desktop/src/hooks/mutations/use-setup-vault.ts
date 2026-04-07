import { ProviderConfig } from "@blinkdisk/schemas/providers";
import { CustomError } from "@blinkdisk/utils/error";
import { showErrorToast } from "@blinkdisk/utils/error-toast";
import { tryCatch } from "@blinkdisk/utils/try-catch";
import { SetupStep } from "@desktop/components/vaults/setup";
import { VaultItem } from "@desktop/hooks/queries/use-vault";
import { useAccountId } from "@desktop/hooks/use-account-id";
import { useQueryKey } from "@desktop/hooks/use-query-key";
import { getConfigCollection } from "@desktop/lib/db";
import { trpc } from "@desktop/lib/trpc";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { generateId } from "@utils/id";
import { STORAGE_PROVIDERS } from "libs/constants/src/providers";

export function useSetupVault({
  onSuccess,
  setStep,
  setInitialConfig,
}: {
  onSuccess?: () => void;
  setStep: (to: SetupStep) => void;
  setInitialConfig: (to: ProviderConfig) => void;
}) {
  const queryClient = useQueryClient();

  const { queryKeys } = useQueryKey();
  const { accountId } = useAccountId();

  return useMutation({
    mutationKey: ["vault", "setup"],
    mutationFn: async (values: {
      vault: VaultItem;
      password: string;
      config: ProviderConfig | null;
    }) => {
      let config = values.config;

      const provider = STORAGE_PROVIDERS.find(
        (p) => p.type === values.vault.provider,
      );

      if (!provider) throw new Error("Invalid provider");

      if (!config) {
        if (provider.type === "CLOUDBLINK") config = {};
        else {
          const configs = getConfigCollection(accountId).find().fetch();

          // Pick the newest config for the vault
          const encryptedConfig = configs
            .sort(
              (a, b) =>
                new Date(b.createdAt).getTime() -
                new Date(a.createdAt).getTime(),
            )
            .find((config) => config.vaultId === values.vault.id);

          // This shouldn't happen in theory
          if (!encryptedConfig) return setStep("CONFIG");

          const [decryptedConfig, err] = await tryCatch(
            window.electron.vault.config.decrypt({
              password: values.password!,
              encrypted: encryptedConfig.data,
            }) as Promise<ProviderConfig>,
          );

          // Very likely the password is incorrect
          if (err) {
            setStep("PASSWORD");
            throw new CustomError("INVALID_PASSWORD");
          }

          if (values.vault.configLevel === "VAULT") config = decryptedConfig;
          else {
            setInitialConfig(decryptedConfig);
            return setStep("CONFIG");
          }
        }
      }

      let cloudBlinkToken: string | undefined;
      if (provider.type === "CLOUDBLINK") {
        const [res, err] = await tryCatch(
          trpc.cloudblink.getVaultToken.query({
            vaultId: values.vault.id,
          }),
        );

        if (err) throw err;

        cloudBlinkToken = res.token;
      }

      // This shouldn't happen in theory
      if (!config) return setStep("CONFIG");

      const validateRes = await window.electron.vault.validate({
        type: values.vault.provider,
        version: values.vault.version,
        password: values.password,
        token: cloudBlinkToken,
        config,
      });

      if (validateRes.code || validateRes.error) {
        if (validateRes.code === "INVALID_PASSWORD") {
          setStep("PASSWORD");
          throw new CustomError("INVALID_PASSWORD");
        }

        setStep("CONFIG");
        throw new Error(validateRes.error?.toString());
      }

      const storedId = atob(validateRes.uniqueID || "");
      if (storedId !== values.vault.coreId) {
        setStep("CONFIG");
        throw new CustomError("INCORRECT_VAULT");
      }

      const connectRes = await window.electron.vault.connect({
        id: values.vault.id,
        name: values.vault.name,
        provider: values.vault.provider,
        version: values.vault.version,
        password: values.password,
        token: cloudBlinkToken,
        config,
      });

      if (connectRes.code || connectRes.error) {
        if (connectRes.code === "INVALID_PASSWORD") {
          setStep("PASSWORD");
          throw new CustomError("INVALID_PASSWORD");
        }

        throw new Error(connectRes.error?.toString());
      }

      await window.electron.vault.password.set({
        vaultId: values.vault.id,
        password: values.password,
      });

      getConfigCollection(accountId).insert({
        id: generateId("Config"),
        data: await window.electron.vault.config.encrypt({
          password: values.password,
          config,
        }),
        level: provider.level,
        vaultId: values.vault.id,
        userName: window.electron.os.userName(values.vault.id),
        hostName: window.electron.os.hostName(values.vault.id),
        createdAt: new Date().toISOString(),
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
