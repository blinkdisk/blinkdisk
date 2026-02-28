import { CreateVaultAlerts } from "@desktop/components/dialogs/create-vault/alerts";
import { ProviderSubmitButton } from "@desktop/components/forms/providers/submit-button";
import { useAzureBlobStorageForm } from "@desktop/hooks/forms/providers/use-azure-blob-storage-form";
import { VaultAction } from "@desktop/hooks/use-config-validation";
import { useAppTranslation } from "@hooks/use-app-translation";
import { ZAzureBlobStorageConfigType } from "@schemas/providers";

export type AzureBlobStorageFormProps = {
  action: VaultAction;
  config?: ZAzureBlobStorageConfigType;
  onSubmit: (config: ZAzureBlobStorageConfigType) => void;
};

export function AzureBlobStorageForm({
  action,
  config,
  onSubmit,
}: AzureBlobStorageFormProps) {
  const { t } = useAppTranslation("vault.providers.AZURE_BLOB_STORAGE.fields");

  const form = useAzureBlobStorageForm({
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
      <form.AppField name="container">
        {(field) => (
          <field.Text
            label={{ title: t("container.label"), required: true }}
            placeholder={t("container.placeholder")}
          />
        )}
      </form.AppField>
      <form.AppField name="account">
        {(field) => (
          <field.Text
            label={{ title: t("account.label"), required: true }}
            placeholder={t("account.placeholder")}
          />
        )}
      </form.AppField>
      <form.AppField name="key">
        {(field) => (
          <field.Password
            label={{ title: t("key.label") }}
            placeholder={t("key.placeholder")}
          />
        )}
      </form.AppField>
      <form.AppField name="domain">
        {(field) => (
          <field.Text
            label={{ title: t("domain.label") }}
            placeholder={t("domain.placeholder")}
          />
        )}
      </form.AppField>
      <form.AppField name="prefix">
        {(field) => (
          <field.Text
            label={{ title: t("prefix.label") }}
            placeholder={t("prefix.placeholder")}
          />
        )}
      </form.AppField>
      <form.AppField name="sasToken">
        {(field) => (
          <field.Password
            label={{ title: t("sasToken.label") }}
            placeholder={t("sasToken.placeholder")}
          />
        )}
      </form.AppField>
      <CreateVaultAlerts form={form} action={action} />
      <ProviderSubmitButton action={action} form={form} />
    </form>
  );
}
