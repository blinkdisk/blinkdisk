import { CreateVaultAlerts } from "@desktop/components/dialogs/create-vault/alerts";
import { ProviderSubmitButton } from "@desktop/components/forms/providers/submit-button";
import { useBackblazeForm } from "@desktop/hooks/forms/providers/use-backblaze-form";
import { VaultAction } from "@desktop/hooks/use-config-validation";
import { useAppTranslation } from "@hooks/use-app-translation";
import { ZBackblazeConfigType } from "@schemas/providers";

export type BackblazeFormProps = {
  action: VaultAction;
  config?: ZBackblazeConfigType;
  onSubmit: (config: ZBackblazeConfigType) => void;
};

export function BackblazeForm({
  action,
  config,
  onSubmit,
}: BackblazeFormProps) {
  const { t } = useAppTranslation("vault.providers.BACKBLAZE.fields");

  const form = useBackblazeForm({
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
      <form.AppField name="bucket">
        {(field) => (
          <field.Text
            label={{ title: t("bucket.label"), required: true }}
            placeholder={t("bucket.placeholder")}
          />
        )}
      </form.AppField>
      <form.AppField name="keyId">
        {(field) => (
          <field.Text
            label={{ title: t("keyId.label"), required: true }}
            placeholder={t("keyId.placeholder")}
          />
        )}
      </form.AppField>
      <form.AppField name="keySecret">
        {(field) => (
          <field.Password
            label={{ title: t("keySecret.label"), required: true }}
            placeholder={t("keySecret.placeholder")}
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
