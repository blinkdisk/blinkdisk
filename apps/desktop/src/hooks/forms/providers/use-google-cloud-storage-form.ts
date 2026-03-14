import { useAppForm } from "@blinkdisk/forms/use-app-form";
import {
  ZGoogleCloudStorageConfig,
  ZGoogleCloudStorageConfigType,
} from "@blinkdisk/schemas/providers";
import {
  useConfigValidation,
  VaultAction,
} from "@desktop/hooks/use-config-validation";

export function useGoogleCloudStorageForm({
  action,
  config,
  onSubmit,
}: {
  action: VaultAction;
  config?: ZGoogleCloudStorageConfigType;
  onSubmit: (value: ZGoogleCloudStorageConfigType) => void;
}) {
  const { onSubmitAsync } = useConfigValidation("GOOGLE_CLOUD_STORAGE", action);

  return useAppForm({
    defaultValues: {
      bucket: "",
      prefix: "",
      credentials: "",
      ...config,
    } as ZGoogleCloudStorageConfigType,
    validators: {
      onSubmit: ZGoogleCloudStorageConfig,
      onSubmitAsync,
    },
    onSubmit: ({ value }) => onSubmit(value),
  });
}
