import {
  resolveStorageProviderType,
  type StorageProviderType,
} from "@blinkdisk/constants/providers";
import { useAppForm } from "@blinkdisk/forms/use-app-form";
import {
  ZFilesystemConfig,
  type ZFilesystemConfigType,
} from "@blinkdisk/schemas/providers";
import {
  useConfigValidation,
  type VaultAction,
} from "@desktop/hooks/use-config-validation";

export type LocalFilesystemProviderType = Extract<
  StorageProviderType,
  | "INTERNAL_DRIVE"
  | "EXTERNAL_DRIVE"
  | "NETWORK_DRIVE"
  | "FILESYSTEM"
  | "NETWORK_ATTACHED_STORAGE"
>;

export function useLocalFilesystemForm({
  action,
  config,
  onSubmit,
  providerType,
}: {
  action: VaultAction;
  config?: ZFilesystemConfigType;
  onSubmit: (value: ZFilesystemConfigType) => void;
  providerType: LocalFilesystemProviderType;
}) {
  const { onSubmitAsync } = useConfigValidation(
    resolveStorageProviderType(providerType),
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
