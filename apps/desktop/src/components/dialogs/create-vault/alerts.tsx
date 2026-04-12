import { useStore } from "@blinkdisk/forms/use-app-form";
import { ConfigValidationError } from "@desktop/components/errors/config-validation";
import { VaultExistsError } from "@desktop/components/errors/vault-exists";
import { VaultAction } from "@desktop/hooks/use-config-validation";
import { AnyFormApi } from "@tanstack/react-form";

type CreateVaultAlertsProps = {
  form: AnyFormApi;
  action: VaultAction;
};

export function CreateVaultAlerts({ form, action }: CreateVaultAlertsProps) {
  const errors = useStore(form.store, (store) => store.errorMap);

  if (action === "UPDATE") return null;
  if (
    errors &&
    errors.onSubmit &&
    errors.onSubmit.code === "VAULT_VALIDATION_FAILED"
  )
    return <ConfigValidationError message={errors.onSubmit.message} />;
  if (
    errors &&
    errors.onSubmit &&
    errors.onSubmit.code === "VAULT_ALREADY_EXISTS"
  )
    return <VaultExistsError name={errors.onSubmit.name} />;

  return null;
}
