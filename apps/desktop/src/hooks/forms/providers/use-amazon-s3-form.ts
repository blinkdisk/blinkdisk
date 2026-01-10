import {
  useConfigValidation,
  VaultAction,
} from "@desktop/hooks/use-config-validation";
import { useAppForm } from "@hooks/use-app-form";
import { ZAmazonS3Config, ZAmazonS3ConfigType } from "@schemas/providers";

export function useAmazonS3Form({
  action,
  config,
  onSubmit,
  coreId,
}: {
  action: VaultAction;
  config?: ZAmazonS3ConfigType;
  onSubmit: (value: ZAmazonS3ConfigType) => void;
  coreId?: string;
}) {
  const { onSubmitAsync } = useConfigValidation("AMAZON_S3", action, coreId);

  return useAppForm({
    defaultValues: {
      endpoint: "https://s3.amazonaws.com",
      bucket: "",
      region: "",
      accessKeyId: "",
      accessKeySecret: "",
      sessionToken: "",
      prefix: "",
      ...config,
    } as ZAmazonS3ConfigType,
    validators: {
      onSubmit: ZAmazonS3Config,
      onSubmitAsync,
    },
    onSubmit: ({ value }) => onSubmit(value),
  });
}
