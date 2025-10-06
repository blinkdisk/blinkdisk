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
  storageId,
}: {
  action: VaultAction;
  config?: ZFilesystemConfigType;
  onSubmit: (value: ZFilesystemConfigType) => void;
  storageId?: string;
}) {
  const { onSubmitAsync } = useConfigValidation(
    "NETWORK_ATTACHED_STORAGE",
    action,
    storageId,
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
