import { CreateVaultAlerts } from "@desktop/components/dialogs/create-vault/alerts";
import { ProviderSubmitButton } from "@desktop/components/forms/providers/submit-button";
import { useAmazonS3Form } from "@desktop/hooks/forms/providers/use-amazon-s3-form";
import { VaultAction } from "@desktop/hooks/use-config-validation";
import { useAppTranslation } from "@hooks/use-app-translation";
import { ZAmazonS3ConfigType } from "@schemas/providers";

export type AmazonS3FormProps = {
  action: VaultAction;
  config?: ZAmazonS3ConfigType;
  onSubmit: (config: ZAmazonS3ConfigType) => void;
  coreId?: string;
};

export function AmazonS3Form({
  action,
  config,
  onSubmit,
  coreId,
}: AmazonS3FormProps) {
  const { t } = useAppTranslation("vault.providers.AMAZON_S3.fields");

  const form = useAmazonS3Form({
    action,
    config,
    onSubmit,
    coreId,
  });

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        form.handleSubmit(e);
      }}
      className="flex w-full flex-col gap-4"
    >
      <form.AppField name="endpoint">
        {(field) => (
          <field.Text
            label={{ title: t("endpoint.label"), required: true }}
            placeholder={t("endpoint.placeholder")}
          />
        )}
      </form.AppField>
      <form.AppField name="bucket">
        {(field) => (
          <field.Text
            label={{ title: t("bucket.label"), required: true }}
            placeholder={t("bucket.placeholder")}
          />
        )}
      </form.AppField>
      <form.AppField name="region">
        {(field) => (
          <field.Text
            label={{ title: t("region.label"), required: true }}
            placeholder={t("region.placeholder")}
          />
        )}
      </form.AppField>
      <form.AppField name="accessKeyId">
        {(field) => (
          <field.Text
            label={{ title: t("accessKeyId.label"), required: true }}
            placeholder={t("accessKeyId.placeholder")}
          />
        )}
      </form.AppField>
      <form.AppField name="accessKeySecret">
        {(field) => (
          <field.Password
            label={{ title: t("accessKeySecret.label"), required: true }}
            placeholder={t("accessKeySecret.placeholder")}
          />
        )}
      </form.AppField>
      <form.AppField name="sessionToken">
        {(field) => (
          <field.Password
            label={{ title: t("sessionToken.label") }}
            placeholder={t("sessionToken.placeholder")}
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
      <CreateVaultAlerts form={form} action={action} />
      <ProviderSubmitButton action={action} form={form} />
    </form>
  );
}
