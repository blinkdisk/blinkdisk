import { FormDisabledContext, useStore } from "@blinkdisk/forms/use-app-form";
import { useAppTranslation } from "@blinkdisk/hooks/use-app-translation";
import { Button } from "@blinkdisk/ui/button";
import {
  SettingsGroup,
  SettingsPanel,
  SettingsRow,
} from "@desktop/components/settings";
import { useUpdateVaultForm } from "@desktop/hooks/forms/use-update-vault-form";
import { useDeleteVaultDialog } from "@desktop/hooks/state/use-delete-vault-dialog";
import { useMoveVaultsDialog } from "@desktop/hooks/state/use-move-vaults-dialog";
import { useAccountId } from "@desktop/hooks/use-account-id";
import { useVaultId } from "@desktop/hooks/use-vault-id";
import { ArrowUpDownIcon, TrashIcon } from "lucide-react";
import { useContext } from "react";
import { VaultConfigSettings } from "./config";

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
    <>
      <SettingsGroup title={t("title")}>
        <SettingsPanel>
          <form
            className="contents"
            onSubmit={(e) => {
              e.preventDefault();
              form.handleSubmit(e);
            }}
          >
            <SettingsRow title={t("name.label")} description={t("description")}>
              <div className="flex w-full flex-col gap-2 md:w-auto md:flex-row md:items-center">
                <form.AppField name="name">
                  {(field) => (
                    <field.Text
                      label={{
                        title: t("name.label"),
                        labelClassName: "sr-only",
                        required: true,
                      }}
                      placeholder={t("name.placeholder")}
                      className="md:w-64"
                    />
                  )}
                </form.AppField>
                <form.AppForm>
                  <form.Submit className="w-fit" disabled={!isDirty} size="sm">
                    {t("save")}
                  </form.Submit>
                </form.AppForm>
              </div>
            </SettingsRow>
          </form>
          {isLocalAccount ? (
            <SettingsRow
              title={t("move.title")}
              description={t("move.description")}
            >
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
            </SettingsRow>
          ) : null}
          <SettingsRow
            title={t("delete.title")}
            description={t("delete.description")}
          >
            <Button
              disabled={disabled}
              onClick={() => vaultId && openDeleteVaultDialog({ vaultId })}
              variant="destructive-secondary"
              size="sm"
            >
              <TrashIcon /> {t("delete.button")}
            </Button>
          </SettingsRow>
        </SettingsPanel>
      </SettingsGroup>
      <VaultConfigSettings />
    </>
  );
}
