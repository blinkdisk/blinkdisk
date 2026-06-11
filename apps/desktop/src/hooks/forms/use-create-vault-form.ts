import {
  resolveStorageProviderType,
  type StorageProviderType,
} from "@blinkdisk/constants/providers";
import { useAppForm } from "@blinkdisk/forms/use-app-form";
import { useAppTranslation } from "@blinkdisk/hooks/use-app-translation";
import type { ProviderConfig } from "@blinkdisk/schemas/providers";
import { ZCreateVaultDetails } from "@blinkdisk/schemas/vault";
import {
  type CreateVaultResponse,
  useCreateVault,
} from "@desktop/hooks/mutations/use-create-vault";

export function useCreateVaultForm({
  providerType,
  onSuccess,
  config,
}: {
  providerType?: StorageProviderType;
  onSuccess?: (res: CreateVaultResponse) => void;
  config?: ProviderConfig;
}) {
  const { t } = useAppTranslation("vault.providers");

  const { mutateAsync } = useCreateVault((res) => {
    form.reset();
    onSuccess?.(res);
  });
  const displayProviderType = providerType
    ? resolveStorageProviderType(providerType)
    : undefined;

  const form = useAppForm({
    defaultValues: {
      name: displayProviderType ? t(`${displayProviderType}.name`) : "",
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
