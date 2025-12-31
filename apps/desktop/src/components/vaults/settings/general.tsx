import { SettingsCategory } from "@desktop/components/policy/category";
import { useUpdateVaultForm } from "@desktop/hooks/forms/use-update-vault-form";
import { useDeleteVaultDialog } from "@desktop/hooks/state/use-delete-vault-dialog";
import { useVaultId } from "@desktop/hooks/use-vault-id";
import { FormDisabledContext, useStore } from "@hooks/use-app-form";
import { useAppTranslation } from "@hooks/use-app-translation";
import { Button } from "@ui/button";
import { SettingsIcon, TrashIcon } from "lucide-react";
import { useContext } from "react";

export function VaultGeneralSettings() {
  const { t } = useAppTranslation("settings.vault.general");
  const { openDeleteVaultDialog } = useDeleteVaultDialog();
  const { vaultId } = useVaultId();

  const form = useUpdateVaultForm();
  const isDirty = useStore(form.store, (state) => state.isDirty);
  const disabled = useContext(FormDisabledContext);

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
      <div className="border-destructive/30 relative mt-8 flex justify-between rounded-xl border-2 border-dashed p-4">
        <div>
          <p className="font-medium">{t("delete.title")}</p>
          <p className="text-muted-foreground text-xs">
            {t("delete.description")}
          </p>
        </div>
        <Button
          disabled={disabled}
          onClick={() => vaultId && openDeleteVaultDialog({ vaultId })}
          variant="destructive-secondary"
          size="sm"
        >
          <TrashIcon /> {t("delete.button")}
        </Button>
      </div>
    </SettingsCategory>
  );
}
