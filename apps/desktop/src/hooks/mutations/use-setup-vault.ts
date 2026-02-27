import { SetupStep } from "@desktop/components/vaults/setup";
import { useQueryKey } from "@desktop/hooks/use-query-key";
import { showErrorToast } from "@desktop/lib/error";
import { trpc } from "@desktop/lib/trpc";
import { useAppTranslation } from "@hooks/use-app-translation";
import { ProviderConfig } from "@schemas/providers";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { VaultItem } from "../queries/use-vault";
import { useVaultConfig } from "../queries/use-vault-config";

export function useSetupVault({
  onSuccess,
  setStep,
}: {
  onSuccess: () => void;
  setStep: (step: SetupStep) => void;
}) {
  const queryClient = useQueryClient();

  const { data: loadedConfig } = useVaultConfig();
  const { queryKeys } = useQueryKey();
  const { t } = useAppTranslation("vault.setup.error");

  return useMutation({
    mutationKey: ["vault", "setup"],
    mutationFn: async (values: {
      vault: VaultItem;
      password: string;
      config: ProviderConfig | null;
    }) => {
      let config = values.config;

      if (values.vault.provider === "CLOUDBLINK") config = {};

      if (!config && values.vault.configLevel === "VAULT" && loadedConfig)
        config = loadedConfig;

      if (!config) return setStep("CONFIG");

      const validateRes = await window.electron.vault.validate({
        type: values.vault.provider,
        token: values.vault.token,
        version: values.vault.version,
        config,
      });

      if (validateRes.code || validateRes.error) {
        setStep("CONFIG");
        throw new Error(validateRes.error?.toString());
      }

      const storedId = atob(validateRes.uniqueID || "");
      if (storedId !== values.vault.coreId) {
        setStep("CONFIG");
        return toast.error(t("incorrectVault.title"), {
          description: t("incorrectVault.description"),
        });
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
          return toast.error(t("invalidPassword.title"), {
            description: t("invalidPassword.description"),
          });
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
