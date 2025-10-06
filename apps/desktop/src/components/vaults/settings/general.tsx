import { SettingsCategory } from "@desktop/components/policy/category";
import { useUpdateVaultForm } from "@desktop/hooks/forms/use-update-vault-form";
import { useStore } from "@hooks/use-app-form";
import { useAppTranslation } from "@hooks/use-app-translation";
import { SettingsIcon } from "lucide-react";

export function VaultGeneralSettings() {
  const { t } = useAppTranslation("settings.vault.general");

  const form = useUpdateVaultForm();
  const isDirty = useStore(form.store, (state) => state.isDirty);

  return (
    <SettingsCategory
      id="general"
      title={t("title")}
      description={t("description")}
      icon={<SettingsIcon />}
    >
      <form
        onSubmit={(e) => {
          e.preventDefault();
          form.handleSubmit(e);
        }}
        className="flex flex-col gap-4"
      >
        <form.AppField name="name">
          {(field) => (
            <field.Text
              label={{ title: t("name.label"), required: true }}
              placeholder={t("name.placeholder")}
            />
          )}
        </form.AppField>
        <form.AppForm>
          <form.Submit disabled={!isDirty}>{t("save")}</form.Submit>
        </form.AppForm>
      </form>
    </SettingsCategory>
  );
}
