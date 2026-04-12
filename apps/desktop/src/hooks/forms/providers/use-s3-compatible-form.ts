import { useAppForm } from "@blinkdisk/forms/use-app-form";
import {
  ZS3CompatibleConfig,
  ZS3CompatibleConfigType,
} from "@blinkdisk/schemas/providers";
import {
  useConfigValidation,
  VaultAction,
} from "@desktop/hooks/use-config-validation";

export function useS3CompatibleForm({
  action,
  config,
  onSubmit,
}: {
  action: VaultAction;
  config?: ZS3CompatibleConfigType;
  onSubmit: (value: ZS3CompatibleConfigType) => void;
}) {
  const { onSubmitAsync } = useConfigValidation("S3_COMPATIBLE", action);

  return useAppForm({
    defaultValues: {
      endpoint: "",
      bucket: "",
      accessKeyId: "",
      accessKeySecret: "",
      sessionToken: "",
      prefix: "",
      region: "",
      disableTlsVerification: false,
      disableTls: false,
      ...config,
    } as ZS3CompatibleConfigType,
    validators: {
      onSubmit: ZS3CompatibleConfig,
      onSubmitAsync,
    },
    onSubmit: ({ value }) => onSubmit(value),
  });
}
