import {
  useConfigValidation,
  VaultAction,
} from "@desktop/hooks/use-config-validation";
import { useAppForm } from "@hooks/use-app-form";
import { ZBackblazeConfig, ZBackblazeConfigType } from "@schemas/providers";

export function useBackblazeForm({
  action,
  config,
  onSubmit,
  coreId,
}: {
  action: VaultAction;
  config?: ZBackblazeConfigType;
  onSubmit: (value: ZBackblazeConfigType) => void;
  coreId?: string;
}) {
  const { onSubmitAsync } = useConfigValidation("BACKBLAZE", action, coreId);

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
