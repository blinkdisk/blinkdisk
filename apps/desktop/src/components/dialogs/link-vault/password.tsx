import { useLinkVaultPasswordForm } from "@desktop/hooks/forms/use-link-vault-password-form";
import { useStore } from "@hooks/use-app-form";
import { useAppTranslation } from "@hooks/use-app-translation";
import { ZLinkVaultPasswordType } from "@schemas/vault";
import { Alert, AlertDescription, AlertTitle } from "@ui/alert";
import { AlertTriangleIcon } from "lucide-react";

export type LinkVaultPasswordProps = {
  passwordHash: string | undefined;
  onSubmit?: (value: ZLinkVaultPasswordType) => void;
};

export function LinkVaultPassword({
  passwordHash,
  onSubmit,
}: LinkVaultPasswordProps) {
  const { t } = useAppTranslation("vault.linkDialog.password");

  const form = useLinkVaultPasswordForm({
    passwordHash,
    onSubmit: (values) => onSubmit?.(values),
  });

  const errors = useStore(form.store, (store) => store.errorMap);

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        form.handleSubmit(e);
      }}
      className="mt-8 flex flex-col gap-6"
    >
      <form.AppField name="password">
        {(field) => (
          <field.Password
            label={{ title: t("password.label"), required: true }}
            placeholder={t("password.placeholder")}
          />
        )}
      </form.AppField>
      {errors &&
      errors.onSubmit &&
      errors.onSubmit.code === "INVALID_PASSWORD" ? (
        <Alert variant="destructive">
          <AlertTitle>
            <AlertTriangleIcon className="mb-0.5 mr-2 inline-block size-3.5" />
            {t("invalidError.title")}
          </AlertTitle>
          <AlertDescription className="text-xs">
            {t("invalidError.description")}
          </AlertDescription>
        </Alert>
      ) : null}
      <form.AppForm>
        <form.Submit>{t("submit")}</form.Submit>
      </form.AppForm>
    </form>
  );
}
