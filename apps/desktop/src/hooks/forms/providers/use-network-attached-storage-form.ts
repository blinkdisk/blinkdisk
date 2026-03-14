import { useAppForm } from "@blinkdisk/forms/use-app-form";
import {
  ZFilesystemConfig,
  ZFilesystemConfigType,
} from "@blinkdisk/schemas/providers";
import {
  useConfigValidation,
  VaultAction,
} from "@desktop/hooks/use-config-validation";

export function useNetworkAttachedStorageForm({
  action,
  config,
  onSubmit,
}: {
  action: VaultAction;
  config?: ZFilesystemConfigType;
  onSubmit: (value: ZFilesystemConfigType) => void;
}) {
  const { onSubmitAsync } = useConfigValidation(
    "NETWORK_ATTACHED_STORAGE",
    action,
  );

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
