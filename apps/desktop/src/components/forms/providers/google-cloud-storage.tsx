import { CreateVaultAlerts } from "@desktop/components/dialogs/create-vault/alerts";
import { ProviderSubmitButton } from "@desktop/components/forms/providers/submit-button";
import { useGoogleCloudStorageForm } from "@desktop/hooks/forms/providers/use-google-cloud-storage-form";
import { VaultAction } from "@desktop/hooks/use-config-validation";
import { useAppTranslation } from "@hooks/use-app-translation";
import { ZGoogleCloudStorageConfigType } from "@schemas/providers";

export type GoogleCloudStorageFormProps = {
  action: VaultAction;
  config?: ZGoogleCloudStorageConfigType;
  onSubmit: (config: ZGoogleCloudStorageConfigType) => void;
  storageId?: string;
};

export function GoogleCloudStorageForm({
  action,
  config,
  onSubmit,
  storageId,
}: GoogleCloudStorageFormProps) {
  const { t } = useAppTranslation(
    "vault.providers.GOOGLE_CLOUD_STORAGE.fields",
  );

  const form = useGoogleCloudStorageForm({
    action,
    config,
    onSubmit,
    storageId,
  });

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        form.handleSubmit(e);
      }}
      className="flex w-full flex-col gap-4"
    >
      <form.AppField name="bucket">
        {(field) => (
          <field.Text
            label={{ title: t("bucket.label"), required: true }}
            placeholder={t("bucket.placeholder")}
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
      <form.AppField name="credentials">
        {(field) => (
          <field.Text
            label={{ title: t("credentials.label"), required: true }}
            placeholder={t("credentials.placeholder")}
            as="textarea"
            className="min-h-24"
          />
        )}
      </form.AppField>
      <CreateVaultAlerts form={form} action={action} />
      <ProviderSubmitButton action={action} form={form} />
    </form>
  );
}
