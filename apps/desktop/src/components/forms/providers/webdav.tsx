import { CreateVaultAlerts } from "@desktop/components/dialogs/create-vault/alerts";
import { ProviderSubmitButton } from "@desktop/components/forms/providers/submit-button";
import { useWebDavForm } from "@desktop/hooks/forms/providers/use-webdav-form";
import { VaultAction } from "@desktop/hooks/use-config-validation";
import { useAppTranslation } from "@hooks/use-app-translation";
import { ZWebDavConfigType } from "@schemas/providers";

export type WebDavFormProps = {
  action: VaultAction;
  config?: ZWebDavConfigType;
  onSubmit: (config: ZWebDavConfigType) => void;
  coreId?: string;
};

export function WebDavForm({
  action,
  config,
  onSubmit,
  coreId,
}: WebDavFormProps) {
  const { t } = useAppTranslation("vault.providers.WEBDAV.fields");

  const form = useWebDavForm({
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
      <form.AppField name="url">
        {(field) => (
          <field.Text
            label={{ title: t("url.label"), required: true }}
            placeholder={t("url.placeholder")}
          />
        )}
      </form.AppField>
      <form.AppField name="user">
        {(field) => (
          <field.Text
            label={{ title: t("user.label") }}
            placeholder={t("user.placeholder")}
          />
        )}
      </form.AppField>
      <form.AppField name="password">
        {(field) => (
          <field.Password
            label={{ title: t("password.label") }}
            placeholder={t("password.placeholder")}
          />
        )}
      </form.AppField>
      <CreateVaultAlerts form={form} action={action} />
      <ProviderSubmitButton action={action} form={form} />
    </form>
  );
}
