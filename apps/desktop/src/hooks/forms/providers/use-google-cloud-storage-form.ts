import {
  useConfigValidation,
  VaultAction,
} from "@desktop/hooks/use-config-validation";
import { useAppForm } from "@hooks/use-app-form";
import {
  ZGoogleCloudStorageConfig,
  ZGoogleCloudStorageConfigType,
} from "@schemas/providers";

export function useGoogleCloudStorageForm({
  action,
  config,
  onSubmit,
  vaultId,
}: {
  action: VaultAction;
  config?: ZGoogleCloudStorageConfigType;
  onSubmit: (value: ZGoogleCloudStorageConfigType) => void;
  vaultId?: string;
}) {
  const { onSubmitAsync } = useConfigValidation(
    "GOOGLE_CLOUD_STORAGE",
    action,
    vaultId,
  );

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
