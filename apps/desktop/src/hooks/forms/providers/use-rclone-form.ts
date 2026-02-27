import {
  useConfigValidation,
  VaultAction,
} from "@desktop/hooks/use-config-validation";
import { useAppForm } from "@hooks/use-app-form";
import { ZRcloneConfig, ZRcloneConfigType } from "@schemas/providers";

export function useRcloneForm({
  action,
  config,
  onSubmit,
}: {
  action: VaultAction;
  config?: ZRcloneConfigType;
  onSubmit: (value: ZRcloneConfigType) => void;
}) {
  const { onSubmitAsync } = useConfigValidation("RCLONE", action);

  return useAppForm({
    defaultValues: {
      remotePath: "",
      rclonePath: "",
      ...config,
    } as ZRcloneConfigType,
    validators: {
      onSubmit: ZRcloneConfig,
      onSubmitAsync,
    },
    onSubmit: ({ value }) => {
      // Filter out empty optional fields
      const processedValue = {
        ...value,
        ...(value.rclonePath && { rclonePath: value.rclonePath }),
      };
      onSubmit(processedValue);
    },
  });
}
