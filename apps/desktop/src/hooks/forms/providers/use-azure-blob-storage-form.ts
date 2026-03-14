import { useConfigValidation, VaultAction } from "@desktop/hooks/use-config-validation";
import { useAppForm } from "@blinkdisk/forms/use-app-form";
import {
  ZAzureBlobStorageConfig,
  ZAzureBlobStorageConfigType,
} from "@blinkdisk/schemas/providers";

export function useAzureBlobStorageForm({
  action,
  config,
  onSubmit,
}: {
  action: VaultAction;
  config?: ZAzureBlobStorageConfigType;
  onSubmit: (value: ZAzureBlobStorageConfigType) => void;
}) {
  const { onSubmitAsync } = useConfigValidation("AZURE_BLOB_STORAGE", action);

  return useAppForm({
    defaultValues: {
      container: "",
      account: "",
      key: "",
      domain: "",
      sasToken: "",
      prefix: "",
      ...config,
    } as ZAzureBlobStorageConfigType,
    validators: {
      onSubmit: ZAzureBlobStorageConfig,
      onSubmitAsync,
    },
    onSubmit: ({ value }) => onSubmit(value),
  });
}
