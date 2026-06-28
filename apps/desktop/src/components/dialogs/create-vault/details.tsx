import type { StorageProviderType } from "@blinkdisk/constants/providers";
import { useStore } from "@blinkdisk/forms/use-app-form";
import { useAppTranslation } from "@blinkdisk/hooks/use-app-translation";
import type { ProviderConfig } from "@blinkdisk/schemas/providers";
import { Alert, AlertDescription, AlertTitle } from "@blinkdisk/ui/alert";
import { Button } from "@blinkdisk/ui/button";
import { CloudBlinkLogo } from "@desktop/components/icons/cloudblink";
import { useCreateVaultForm } from "@desktop/hooks/forms/use-create-vault-form";
import { useAccountId } from "@desktop/hooks/use-account-id";
import { useTheme } from "@desktop/hooks/use-theme";
import { useNavigate } from "@tanstack/react-router";
import { AlertTriangleIcon, SquarePenIcon } from "lucide-react";

type CreateVaultDetailsProps = {
  providerType?: StorageProviderType;
  onSubmit?: () => void;
  config?: ProviderConfig;
  autoSelectedProvider?: boolean;
  onChangeStorage?: () => void;
};

function getPasswordScore(password: string) {
  if (!password) return 0;

  let score = 0;
  if (password.length >= 14) score++;
  if (/[a-z]/.test(password) && /[A-Z]/.test(password)) score++;
  if (/\d/.test(password)) score++;
  if (/[^a-zA-Z\d]/.test(password)) score++;

  return Math.min(score, 4);
}

function PasswordStrengthMeter({
  dark,
  password,
}: {
  dark: boolean;
  password: string;
}) {
  const score = getPasswordScore(password);
  const activeBars = password ? Math.max(score, 1) : 0;
  const colors = [
    dark ? "#454545" : "#ddd",
    "#ef4836",
    "#f6b44d",
    "#2b90ef",
    "#25c281",
  ];

  return (
    <div aria-hidden="true" className="flex h-1 gap-1">
      {[1, 2, 3, 4].map((bar) => (
        <div
          className="flex-1 rounded-full transition-colors"
          key={bar}
          style={{
            backgroundColor: bar <= activeBars ? colors[activeBars] : colors[0],
          }}
        />
      ))}
    </div>
  );
}

export function CreateVaultDetails({
  providerType,
  onSubmit,
  config,
  autoSelectedProvider,
  onChangeStorage,
}: CreateVaultDetailsProps) {
  const { t } = useAppTranslation("vault.createDialog.details");
  const { dark } = useTheme();
  const { accountId } = useAccountId();

  const navigate = useNavigate({ from: "/$accountId" });

  const form = useCreateVaultForm({
    config,
    providerType,
    onSuccess: async (res) => {
      if (!accountId) return;

      await navigate({
        to: "/$accountId/$vaultId/$hostName/$userName",
        params: (params) => ({
          ...params,
          vaultId: res.vaultId,
          hostName: window.electron.os.hostName(res.vaultId),
          userName: window.electron.os.userName(res.vaultId),
        }),
      });

      onSubmit?.();
    },
  });

  const values = useStore(form.store, (store) => store.values);

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        form.handleSubmit(e);
      }}
      className="mt-8 flex flex-col gap-6"
    >
      {autoSelectedProvider && providerType === "CLOUDBLINK" ? (
        <div className="border-border bg-card flex flex-col gap-4 rounded-lg border p-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="grid min-w-0 gap-2">
            <CloudBlinkLogo className="mt-1 h-3.5 w-auto" />
            <div className="grid gap-1">
              <p className="text-muted-foreground max-w-68 text-xs leading-4">
                {t("storage.description")}
              </p>
            </div>
          </div>
          <Button
            onClick={onChangeStorage}
            type="button"
            variant="secondary"
            size="sm"
            className="w-full shrink-0 sm:w-auto"
          >
            <SquarePenIcon />
            {t("storage.change")}
          </Button>
        </div>
      ) : null}
      <form.AppField name="name">
        {(field) => (
          <field.Text
            label={{ title: t("name.label"), required: true }}
            placeholder={t("name.placeholder")}
          />
        )}
      </form.AppField>
      <div className="flex flex-col gap-2">
        <form.AppField name="password">
          {(field) => (
            <field.Password
              label={{ title: t("password.label"), required: true }}
              placeholder={t("password.placeholder")}
            />
          )}
        </form.AppField>
        <PasswordStrengthMeter dark={dark} password={values.password || ""} />
      </div>
      <form.AppField
        name="confirmPassword"
        validators={{
          onChangeListenTo: ["password"],
          onChange: ({ value, fieldApi }) => {
            if (value !== fieldApi.form.getFieldValue("password"))
              return { code: "custom", message: "password_mismatch" };

            return undefined;
          },
        }}
      >
        {(field) => (
          <field.Password
            label={{ title: t("confirmPassword.label"), required: true }}
            placeholder={t("confirmPassword.placeholder")}
          />
        )}
      </form.AppField>
      <Alert variant="warn">
        <AlertTriangleIcon />
        <AlertTitle>{t("warning.title")}</AlertTitle>
        <AlertDescription className="text-xs">
          {t("warning.description")}
        </AlertDescription>
      </Alert>
      <form.AppForm>
        <form.Submit>{t("submit")}</form.Submit>
      </form.AppForm>
    </form>
  );
}
