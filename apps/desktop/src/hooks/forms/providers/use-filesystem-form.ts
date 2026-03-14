import { useConfigValidation, VaultAction } from "#hooks/use-config-validation";
import { useAppForm } from "@blinkdisk/forms/use-app-form";
import {
  ZFilesystemConfig,
  ZFilesystemConfigType,
} from "@blinkdisk/schemas/providers";

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
