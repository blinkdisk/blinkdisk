import { ProviderType } from "@config/providers";
import {
  CreateVaultResponse,
  useCreateVault,
} from "@desktop/hooks/mutations/use-create-vault";
import { useAppForm } from "@hooks/use-app-form";
import { useAppTranslation } from "@hooks/use-app-translation";
import { ProviderConfig } from "@schemas/providers";
import { ZCreateVaultDetails } from "@schemas/vault";

export function useCreateVaultForm({
  providerType,
  onSuccess,
  config,
}: {
  providerType?: ProviderType;
  onSuccess?: (res: CreateVaultResponse) => void;
  config?: ProviderConfig;
}) {
  const { t } = useAppTranslation("vault.providers");

  const { mutateAsync } = useCreateVault((res) => {
    form.reset();
    onSuccess?.(res);
  });

  const form = useAppForm({
    defaultValues: {
      name: providerType ? t(`${providerType}.name`) : "",
      password: "",
      confirmPassword: "",
    },
    validators: {
      onSubmit: ZCreateVaultDetails,
    },
    onSubmit: async ({ value }) =>
      providerType &&
      (await mutateAsync({
        name: value.name,
        provider: providerType,
        config: config || {},
        password: value.password,
      })),
  });

  return form;
}
