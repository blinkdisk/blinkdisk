import { resolveStorageProviderType } from "@blinkdisk/constants/providers";
import { useAppTranslation } from "@blinkdisk/hooks/use-app-translation";
import type { ZFilesystemConfigType } from "@blinkdisk/schemas/providers";
import { CreateVaultAlerts } from "@desktop/components/dialogs/create-vault/alerts";
import { ProviderSubmitButton } from "@desktop/components/forms/providers/submit-button";
import {
  type LocalFilesystemProviderType,
  useLocalFilesystemForm,
} from "@desktop/hooks/forms/providers/use-local-filesystem-form";
import type { VaultAction } from "@desktop/hooks/use-config-validation";

export type LocalFilesystemFormProps = {
  action: VaultAction;
  config?: ZFilesystemConfigType;
  onSubmit: (config: ZFilesystemConfigType) => void;
  providerType: LocalFilesystemProviderType;
};

export function LocalFilesystemForm({
  action,
  config,
  onSubmit,
  providerType,
}: LocalFilesystemFormProps) {
  const displayProviderType = resolveStorageProviderType(providerType);
  const { t } = useAppTranslation(
    `vault.providers.${displayProviderType}.fields`,
  );

  const form = useLocalFilesystemForm({
    action,
    config,
    onSubmit,
    providerType,
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
