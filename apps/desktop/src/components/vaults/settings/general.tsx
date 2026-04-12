import { FormDisabledContext, useStore } from "@blinkdisk/forms/use-app-form";
import { useAppTranslation } from "@blinkdisk/hooks/use-app-translation";
import { Button } from "@blinkdisk/ui/button";
import { SettingsCategory } from "@desktop/components/policy/category";
import { useUpdateVaultForm } from "@desktop/hooks/forms/use-update-vault-form";
import { useDeleteVaultDialog } from "@desktop/hooks/state/use-delete-vault-dialog";
import { useMoveVaultsDialog } from "@desktop/hooks/state/use-move-vaults-dialog";
import { useAccountId } from "@desktop/hooks/use-account-id";
import { useVaultId } from "@desktop/hooks/use-vault-id";
import { ArrowUpDownIcon, SettingsIcon, TrashIcon } from "lucide-react";
import { useContext } from "react";

export function VaultGeneralSettings() {
  const { t } = useAppTranslation("settings.vault.general");
  const { openDeleteVaultDialog } = useDeleteVaultDialog();
  const { openMoveVaultsDialog } = useMoveVaultsDialog();
  const { vaultId } = useVaultId();
  const { isLocalAccount } = useAccountId();

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
      <div className="mt-8 flex flex-col gap-6">
        {isLocalAccount ? (
          <div className="flex justify-between">
            <div>
              <p className="m-0! font-medium">{t("move.title")}</p>
              <p className="text-muted-foreground text-xs">
                {t("move.description")}
              </p>
            </div>
            <Button
              disabled={disabled}
              onClick={() =>
                vaultId && openMoveVaultsDialog({ vaultIds: [vaultId] })
              }
              variant="secondary"
              size="sm"
            >
              <ArrowUpDownIcon /> {t("move.button")}
            </Button>
          </div>
        ) : null}
        <div className="flex justify-between">
          <div>
            <p className="m-0! font-medium">{t("delete.title")}</p>
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
      </div>
    </SettingsCategory>
  );
}
