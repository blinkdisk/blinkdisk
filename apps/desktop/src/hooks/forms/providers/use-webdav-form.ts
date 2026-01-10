import {
  useConfigValidation,
  VaultAction,
} from "@desktop/hooks/use-config-validation";
import { useAppForm } from "@hooks/use-app-form";
import { ZWebDavConfig, ZWebDavConfigType } from "@schemas/providers";

export function useWebDavForm({
  action,
  config,
  onSubmit,
  coreId,
}: {
  action: VaultAction;
  config?: ZWebDavConfigType;
  onSubmit: (value: ZWebDavConfigType) => void;
  coreId?: string;
}) {
  const { onSubmitAsync } = useConfigValidation("WEBDAV", action, coreId);

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
