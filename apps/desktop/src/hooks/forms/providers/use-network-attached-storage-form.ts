import {
  useConfigValidation,
  VaultAction,
} from "@desktop/hooks/use-config-validation";
import { useAppForm } from "@hooks/use-app-form";
import { ZFilesystemConfig, ZFilesystemConfigType } from "@schemas/providers";

export function useNetworkAttachedStorageForm({
  action,
  config,
  onSubmit,
  coreId,
}: {
  action: VaultAction;
  config?: ZFilesystemConfigType;
  onSubmit: (value: ZFilesystemConfigType) => void;
  coreId?: string;
}) {
  const { onSubmitAsync } = useConfigValidation(
    "NETWORK_ATTACHED_STORAGE",
    action,
    coreId,
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
