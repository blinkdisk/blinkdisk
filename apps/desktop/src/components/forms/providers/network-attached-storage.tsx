import { useAppTranslation } from "@blinkdisk/hooks/use-app-translation";
import { ZFilesystemConfigType } from "@blinkdisk/schemas/providers";
import { CreateVaultAlerts } from "@desktop/components/dialogs/create-vault/alerts";
import { ProviderSubmitButton } from "@desktop/components/forms/providers/submit-button";
import { useNetworkAttachedStorageForm } from "@desktop/hooks/forms/providers/use-network-attached-storage-form";
import { VaultAction } from "@desktop/hooks/use-config-validation";

export type NetworkAttachedStorageFormProps = {
  action: VaultAction;
  config?: ZFilesystemConfigType;
  onSubmit: (config: ZFilesystemConfigType) => void;
};

export function NetworkAttachedStorageForm({
  action,
  config,
  onSubmit,
}: NetworkAttachedStorageFormProps) {
  const { t } = useAppTranslation(
    "vault.providers.NETWORK_ATTACHED_STORAGE.fields",
  );

  const form = useNetworkAttachedStorageForm({
    action,
    config,
    onSubmit,
  });

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        form.handleSubmit(e);
      }}
      className="flex w-full flex-col gap-4"
    >
      <form.AppField name="path">
        {(field) => (
          <field.Path
            label={{ title: t("path.label"), required: true }}
            placeholder={t("path.placeholder")}
            title={t("path.dialogTitle")}
            type="directory"
          />
        )}
      </form.AppField>
      <CreateVaultAlerts form={form} action={action} />
      <ProviderSubmitButton action={action} form={form} />
    </form>
  );
}
