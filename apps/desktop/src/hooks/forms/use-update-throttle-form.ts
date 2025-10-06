import { useUpdateThrottle } from "@desktop/hooks/mutations/core/use-update-throttle";
import { useVaultThrottle } from "@desktop/hooks/queries/core/use-vault-throttle";
import { useAppForm } from "@hooks/use-app-form";
import { ZVaultThrottle, ZVaultThrottleType } from "@schemas/vault";

export function useUpdateThrottleForm() {
  const { data: throttle } = useVaultThrottle();
  const { mutateAsync } = useUpdateThrottle(() => form.reset());

  const form = useAppForm({
    defaultValues: {
      upload: {
        enabled: throttle?.upload?.enabled || false,
        limit: throttle?.upload?.limit || {
          value: 0,
          unit: "Mbps",
        },
      },
      download: {
        enabled: throttle?.download?.enabled || false,
        limit: throttle?.download?.limit || {
          value: 0,
          unit: "bps",
        },
      },
    } as ZVaultThrottleType,
    validators: {
      onSubmit: ZVaultThrottle,
    },
    onSubmit: async ({ value }) => await mutateAsync(value),
  });

  return form;
}
