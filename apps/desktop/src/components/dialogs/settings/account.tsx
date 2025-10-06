import { useUpdateAccountForm } from "@desktop/hooks/forms/use-update-account-form";
import { useAccountSettingsDialog } from "@desktop/hooks/state/use-account-settings-dialog";
import { useAppTranslation } from "@hooks/use-app-translation";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@ui/dialog";

export function AccountSettingsDialog() {
  const { t } = useAppTranslation("settings.account");
  const { isOpen, setIsOpen } = useAccountSettingsDialog();

  const form = useUpdateAccountForm();

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="w-90">
        <DialogTitle>{t("title")}</DialogTitle>
        <DialogDescription className="sr-only">
          {t("description")}
        </DialogDescription>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            form.handleSubmit(e);
          }}
          className="mt-8 flex flex-col gap-6"
        >
          <div className="flex gap-4">
            <form.AppField name="firstName">
              {(field) => (
                <field.Text
                  label={{ title: t("auth:register.firstName.label") }}
                  placeholder={t("auth:register.firstName.placeholder")}
                />
              )}
            </form.AppField>
            <form.AppField name="lastName">
              {(field) => (
                <field.Text
                  label={{ title: t("auth:register.lastName.label") }}
                  placeholder={t("auth:register.lastName.placeholder")}
                />
              )}
            </form.AppField>
          </div>
          <form.AppField name="email">
            {(field) => (
              <field.Text
                readOnly
                disabled
                label={{ title: t("auth:register.email.label") }}
                placeholder={t("auth:register.email.placeholder")}
              />
            )}
          </form.AppField>
          <form.AppForm>
            <form.Submit>{t("submit")}</form.Submit>
          </form.AppForm>
        </form>
      </DialogContent>
    </Dialog>
  );
}
