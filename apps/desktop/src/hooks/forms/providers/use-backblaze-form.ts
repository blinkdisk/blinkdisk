import { useAppForm } from "@blinkdisk/forms/use-app-form";
import {
  ZBackblazeConfig,
  type ZBackblazeConfigType,
} from "@blinkdisk/schemas/providers";
import {
  useConfigValidation,
  type VaultAction,
} from "@desktop/hooks/use-config-validation";

export function useBackblazeForm({
  action,
  config,
  onSubmit,
}: {
  action: VaultAction;
  config?: ZBackblazeConfigType;
  onSubmit: (value: ZBackblazeConfigType) => void;
}) {
  const { onSubmitAsync } = useConfigValidation("BACKBLAZE", action);

  return useAppForm({
    defaultValues: {
      bucket: "",
      keyId: "",
      keySecret: "",
      prefix: "",
      ...config,
    } as ZBackblazeConfigType,
    validators: {
      onSubmit: ZBackblazeConfig,
      onSubmitAsync,
    },
    onSubmit: ({ value }) => onSubmit(value),
  });
}
