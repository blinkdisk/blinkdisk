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
import { use } from "react";
import { VaultConfigSettings } from "./config";
import { VaultThrottleSettings } from "./throttle";

export function VaultGeneralSettings() {
  const { t } = useAppTranslation("settings.vault.general");
  const { openDeleteVaultDialog } = useDeleteVaultDialog();
  const { openMoveVaultsDialog } = useMoveVaultsDialog();
  const { vaultId } = useVaultId();
  const { isLocalAccount } = useAccountId();

  const form = useUpdateVaultForm();
  const [isDirty, isSubmitting] = useStore(form.store, (state) => [
    state.isDirty,
    state.isSubmitting,
  ]);
  const disabled = use(FormDisabledContext);

  const submitIfNeeded = () => {
    if (!isDirty || isSubmitting) return;

    form.handleSubmit();
  };

  return (
    <>
      <SettingsGroup title={t("title")}>
        <SettingsPanel>
          <form
            className="contents"
            onSubmit={(e) => {
              e.preventDefault();
              submitIfNeeded();
            }}
            onBlur={(e) => {
              if (!(e.target instanceof HTMLInputElement)) return;
              if (e.target.name !== "name") return;

              submitIfNeeded();
            }}
          >
            <SettingsRow title={t("name.label")} description={t("description")}>
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
            </SettingsRow>
          </form>
          {isLocalAccount ? (
            <SettingsRow
              title={t("move.title")}
              description={t("move.description")}
              separated
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
      <VaultThrottleSettings />
      <VaultConfigSettings />
    </>
  );
}
