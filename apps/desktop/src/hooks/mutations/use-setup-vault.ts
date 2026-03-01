import { SetupStep } from "@desktop/components/vaults/setup";
import { useQueryKey } from "@desktop/hooks/use-query-key";
import { showErrorToast } from "@desktop/lib/error";
import { trpc } from "@desktop/lib/trpc";
import { ProviderConfig } from "@schemas/providers";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { CustomError } from "@utils/error";
import { tryCatch } from "@utils/try-catch";
import { VaultItem } from "../queries/use-vault";

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

  return useMutation({
    mutationKey: ["vault", "setup"],
    mutationFn: async (values: {
      vault: VaultItem;
      password: string;
      config: ProviderConfig | null;
    }) => {
      let config = values.config;

      if (!config) {
        if (values.vault.provider === "CLOUDBLINK") config = {};
        else {
          const configs = await trpc.config.list.query();

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

      // This shouldn't happen in theory
      if (!config) return setStep("CONFIG");

      const validateRes = await window.electron.vault.validate({
        type: values.vault.provider,
        token: values.vault.token,
        version: values.vault.version,
        password: values.password,
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
        token: values.vault.token,
        password: values.password,
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

      return await trpc.config.add.mutate({
        vaultId: values.vault.id,
        userName: window.electron.os.userName(values.vault.id),
        hostName: window.electron.os.hostName(values.vault.id),
        config: await window.electron.vault.config.encrypt({
          password: values.password,
          config,
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
