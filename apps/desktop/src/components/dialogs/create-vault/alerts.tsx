import { ConfigValidationError } from "@desktop/components/errors/config-validation";
import { IncorrectVaultError } from "@desktop/components/errors/incorrect-vault";
import { VaultExistsError } from "@desktop/components/errors/vault-exists";
import { VaultAction } from "@desktop/hooks/use-config-validation";
import { useStore } from "@hooks/use-app-form";
import { useAppTranslation } from "@hooks/use-app-translation";
import { Alert, AlertDescription, AlertTitle } from "@ui/alert";
import { InfoIcon } from "lucide-react";

type CreateVaultAlertsProps = {
  // TODO: Find a better way to type this
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  form: any;
  action: VaultAction;
};

export function CreateVaultAlerts({ form, action }: CreateVaultAlertsProps) {
  const { t } = useAppTranslation("vault.createDialog.config.info");

  // TODO: Find a better way to type this
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const errors = useStore<any>(form.store, (store) => store.errorMap);

  if (action === "UPDATE") return null;
  if (
    errors &&
    errors.onSubmit &&
    errors.onSubmit.code === "STORAGE_VALIDATION_FAILED"
  )
    return <ConfigValidationError message={errors.onSubmit.message} />;
  if (
    errors &&
    errors.onSubmit &&
    errors.onSubmit.code === "INCORRECT_STORAGE_FOUND"
  )
    return <IncorrectVaultError />;
  if (
    errors &&
    errors.onSubmit &&
    (errors.onSubmit.code === "STORAGE_ALREADY_EXISTS" ||
      errors.onSubmit.code === "STORAGE_NOT_FOUND")
  )
    return <VaultExistsError code={errors.onSubmit.code} />;

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
