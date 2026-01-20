import { ConfigValidationError } from "@desktop/components/errors/config-validation";
import { IncorrectVaultError } from "@desktop/components/errors/incorrect-vault";
import { VaultExistsError } from "@desktop/components/errors/vault-exists";
import { VaultAction } from "@desktop/hooks/use-config-validation";
import { useStore } from "@hooks/use-app-form";
import { useAppTranslation } from "@hooks/use-app-translation";
import { AnyFormApi } from "@tanstack/react-form";
import { Alert, AlertDescription, AlertTitle } from "@ui/alert";
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
    errors.onSubmit.code === "INCORRECT_VAULT_FOUND"
  )
    return <IncorrectVaultError />;
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
