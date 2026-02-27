import { CreateVaultAlerts } from "@desktop/components/dialogs/create-vault/alerts";
import { ProviderSubmitButton } from "@desktop/components/forms/providers/submit-button";
import { useRcloneForm } from "@desktop/hooks/forms/providers/use-rclone-form";
import { VaultAction } from "@desktop/hooks/use-config-validation";
import { useAppTranslation } from "@hooks/use-app-translation";
import { ZRcloneConfigType } from "@schemas/providers";

export type RcloneFormProps = {
  action: VaultAction;
  config?: ZRcloneConfigType;
  onSubmit: (config: ZRcloneConfigType) => void;
};

export function RcloneForm({
  action,
  config,
  onSubmit,
}: RcloneFormProps) {
  const { t } = useAppTranslation("vault.providers.RCLONE.fields");

  const form = useRcloneForm({
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
      <form.AppField name="remotePath">
        {(field) => (
          <field.Text
            label={{ title: t("remotePath.label"), required: true }}
            placeholder={t("remotePath.placeholder")}
          />
        )}
      </form.AppField>
      <form.AppField name="rclonePath">
        {(field) => (
          <field.Text
            label={{ title: t("rclonePath.label") }}
            placeholder={t("rclonePath.placeholder")}
          />
        )}
      </form.AppField>
      <CreateVaultAlerts form={form} action={action} />
      <ProviderSubmitButton action={action} form={form} />
    </form>
  );
}
