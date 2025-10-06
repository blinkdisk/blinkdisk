import { ProviderType } from "@config/providers";
import {
  CreateVaultResponse,
  useCreateVault,
} from "@desktop/hooks/mutations/use-create-vault";
import { useProfile } from "@desktop/hooks/use-profile";
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

  const { profileId } = useProfile();

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
      profileId &&
      (await mutateAsync({
        profileId: profileId,
        name: value.name,
        provider: providerType,
        config: config || {},
        password: value.password,
      })),
  });

  return form;
}
