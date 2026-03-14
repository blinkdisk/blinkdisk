import { useAppForm } from "@blinkdisk/forms/use-app-form";
import {
  ZFilesystemConfig,
  ZFilesystemConfigType,
} from "@blinkdisk/schemas/providers";
import {
  useConfigValidation,
  VaultAction,
} from "@desktop/hooks/use-config-validation";

export function useFilesystemForm({
  action,
  config,
  onSubmit,
}: {
  action: VaultAction;
  config?: ZFilesystemConfigType;
  onSubmit: (value: ZFilesystemConfigType) => void;
}) {
  const { onSubmitAsync } = useConfigValidation("FILESYSTEM", action);

  return useAppForm({
    defaultValues: {
      path: "",
      ...config,
    },
    validators: {
      onSubmit: ZFilesystemConfig,
      onSubmitAsync,
    },
    onSubmit: ({ value }) => onSubmit(value),
  });
}
