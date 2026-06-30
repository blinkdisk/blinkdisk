import { useAppForm } from "@blinkdisk/forms/use-app-form";
import {
  ZVaultThrottle,
  type ZVaultThrottleType,
} from "@blinkdisk/schemas/vault";
import { useUpdateThrottle } from "@desktop/hooks/mutations/core/use-update-throttle";
import { useVaultThrottle } from "@desktop/hooks/queries/core/use-vault-throttle";
import { DEFAULT_THROTTLE_LIMIT } from "@desktop/lib/throttle";

export function useUpdateThrottleForm() {
  const { data: throttle } = useVaultThrottle();
  const { mutateAsync } = useUpdateThrottle();

  const form = useAppForm({
    defaultValues: {
      upload: {
        enabled: throttle?.upload?.enabled || false,
        limit: throttle?.upload?.limit || DEFAULT_THROTTLE_LIMIT,
      },
      download: {
        enabled: throttle?.download?.enabled || false,
        limit: throttle?.download?.limit || DEFAULT_THROTTLE_LIMIT,
      },
    } as ZVaultThrottleType,
    validators: {
      onSubmit: ZVaultThrottle,
    },
    onSubmit: async ({ value }) => {
      await mutateAsync(value);
      form.reset();
    },
  });

  return form;
}
