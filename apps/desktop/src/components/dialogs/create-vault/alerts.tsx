import { ConfigValidationError } from "#components/errors/config-validation";
import { VaultExistsError } from "#components/errors/vault-exists";
import { VaultAction } from "#hooks/use-config-validation";
import { useStore } from "@blinkdisk/forms/use-app-form";
import { useAppTranslation } from "@blinkdisk/hooks/use-app-translation";
import { Alert, AlertDescription, AlertTitle } from "@blinkdisk/ui/alert";
import { AnyFormApi } from "@tanstack/react-form";
import { InfoIcon } from "lucide-react";

type CreateVaultAlertsProps = {
  form: AnyFormApi;
  action: VaultAction;
};

export function CreateVaultAlerts({ form, action }: CreateVaultAlertsProps) {
  const { t } = useAppTranslation("vault.createDialog.config.info");

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

  return (
    <Alert variant="info">
      <InfoIcon />
      <AlertTitle>{t("title")}</AlertTitle>
      <AlertDescription className="text-xs">
        {t("description")}
      </AlertDescription>
    </Alert>
  );
}
