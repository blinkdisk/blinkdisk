import { useAddVaultPasswordForm } from "@desktop/hooks/forms/use-add-vault-password-form";
import { VaultItem } from "@desktop/hooks/queries/use-vault";
import { useStore } from "@hooks/use-app-form";
import { useAppTranslation } from "@hooks/use-app-translation";
import { Alert, AlertDescription, AlertTitle } from "@ui/alert";
import { AlertTriangleIcon, LockIcon } from "lucide-react";

interface PasswordMissingProps {
  vault: VaultItem;
}

export function PasswordMissing({ vault }: PasswordMissingProps) {
  const { t } = useAppTranslation("vault.passwordMissing");

  const form = useAddVaultPasswordForm({
    passwordHash: vault?.passwordHash,
    storageId: vault?.storageId,
  });

  const errors = useStore(form.store, (store) => store.errorMap);

  return (
    <div className="flex h-full w-full flex-col items-center overflow-y-auto py-12">
      <div className="mt-auto"></div>
      <div className="flex flex-col items-center justify-center sm:w-80">
        <div className="bg-muted flex size-14 items-center justify-center rounded-xl border">
          <LockIcon className="text-muted-foreground size-6" />
        </div>
        <h1 className="mt-6 text-3xl font-bold">{t("title")}</h1>
        <p className="text-muted-foreground mt-3 text-center text-sm">
          {t("description")}
        </p>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            form.handleSubmit(e);
          }}
          className="mt-8 flex w-full flex-col gap-6"
        >
          <form.AppField name="password">
            {(field) => (
              <field.Password
                label={{ title: t("password.label") }}
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
      </div>
      <div className="mb-auto"></div>
    </div>
  );
}
