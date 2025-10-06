import { CreateVaultAlerts } from "@desktop/components/dialogs/create-vault/alerts";
import { ProviderSubmitButton } from "@desktop/components/forms/providers/submit-button";
import { useSftpForm } from "@desktop/hooks/forms/providers/use-sftp-form";
import { VaultAction } from "@desktop/hooks/use-config-validation";
import { useStore } from "@hooks/use-app-form";
import { useAppTranslation } from "@hooks/use-app-translation";
import { ZSftpConfigType } from "@schemas/providers";
import { Alert, AlertDescription, AlertTitle } from "@ui/alert";
import { AlertTriangleIcon } from "lucide-react";

export type SftpFormProps = {
  action: VaultAction;
  config?: ZSftpConfigType;
  onSubmit: (config: ZSftpConfigType) => void;
  storageId?: string;
};

export function SftpForm({
  action,
  config,
  onSubmit,
  storageId,
}: SftpFormProps) {
  const { t } = useAppTranslation("vault.providers.SFTP.fields");

  const form = useSftpForm({
    action,
    config,
    onSubmit,
    storageId,
  });

  const values = useStore(form.store, (store) => store.values);

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        form.handleSubmit(e);
      }}
      className="flex w-full flex-col gap-4"
    >
      <form.AppField name="host">
        {(field) => (
          <field.Text
            label={{ title: t("host.label"), required: true }}
            placeholder={t("host.placeholder")}
          />
        )}
      </form.AppField>
      <form.AppField name="user">
        {(field) => (
          <field.Text
            label={{ title: t("user.label"), required: true }}
            placeholder={t("user.placeholder")}
          />
        )}
      </form.AppField>
      <form.AppField name="port">
        {(field) => (
          <field.Text
            type="number"
            label={{ title: t("port.label"), required: true }}
            placeholder={t("port.placeholder")}
          />
        )}
      </form.AppField>
      <form.AppField name="path">
        {(field) => (
          <field.Text
            label={{ title: t("path.label"), required: true }}
            placeholder={t("path.placeholder")}
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

      <form.AppField name="knownHosts">
        {(field) => (
          <field.Text
            label={{ title: t("knownHosts.label"), required: true }}
            placeholder={t("knownHosts.placeholder")}
            as="textarea"
            className="min-h-24"
          />
        )}
      </form.AppField>
      {action !== "UPDATE" ? (
        <Alert variant="warn">
          <AlertTitle>
            <AlertTriangleIcon className="mb-0.5 mr-2 inline-block size-3.5" />
            {t("knownHosts.warning.title")}
          </AlertTitle>
          <AlertDescription className="text-xs">
            {t("knownHosts.warning.description")}
            <code className="inline-block">{`ssh-keyscan -t ecdsa${values.port !== 22 ? ` -p ${values.port}` : ""} ${values.host || "[host]"}`}</code>
          </AlertDescription>
        </Alert>
      ) : null}
      <form.AppField name="privateKey">
        {(field) => (
          <field.Text
            label={{ title: t("privateKey.label"), required: true }}
            placeholder={t("privateKey.placeholder")}
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
