import { useAppForm } from "@blinkdisk/forms/use-app-form";
import { ZWebDavConfig, ZWebDavConfigType } from "@blinkdisk/schemas/providers";
import {
  useConfigValidation,
  VaultAction,
} from "@desktop/hooks/use-config-validation";

export function useWebDavForm({
  action,
  config,
  onSubmit,
}: {
  action: VaultAction;
  config?: ZWebDavConfigType;
  onSubmit: (value: ZWebDavConfigType) => void;
}) {
  const { onSubmitAsync } = useConfigValidation("WEBDAV", action);

  return useAppForm({
    defaultValues: {
      url: "",
      user: "",
      password: "",
      ...config,
    } as ZWebDavConfigType,
    validators: {
      onSubmit: ZWebDavConfig,
      onSubmitAsync,
    },
    onSubmit: ({ value }) => onSubmit(value),
  });
}
