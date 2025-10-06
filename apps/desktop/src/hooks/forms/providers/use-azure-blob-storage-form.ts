import {
  useConfigValidation,
  VaultAction,
} from "@desktop/hooks/use-config-validation";
import { useAppForm } from "@hooks/use-app-form";
import {
  ZAzureBlobStorageConfig,
  ZAzureBlobStorageConfigType,
} from "@schemas/providers";

export function useAzureBlobStorageForm({
  action,
  config,
  onSubmit,
  storageId,
}: {
  action: VaultAction;
  config?: ZAzureBlobStorageConfigType;
  onSubmit: (value: ZAzureBlobStorageConfigType) => void;
  storageId?: string;
}) {
  const { onSubmitAsync } = useConfigValidation(
    "AZURE_BLOB_STORAGE",
    action,
    storageId,
  );

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
