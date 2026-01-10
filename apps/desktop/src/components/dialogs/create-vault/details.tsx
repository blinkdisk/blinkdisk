import { ProviderType } from "@config/providers";
import { useCreateVaultForm } from "@desktop/hooks/forms/use-create-vault-form";
import { useProfile } from "@desktop/hooks/use-profile";
import { useTheme } from "@desktop/hooks/use-theme";
import { useStore } from "@hooks/use-app-form";
import { useAppTranslation } from "@hooks/use-app-translation";
import { ProviderConfig } from "@schemas/providers";
import { useNavigate } from "@tanstack/react-router";
import { Alert, AlertDescription, AlertTitle } from "@ui/alert";
import { AlertTriangleIcon } from "lucide-react";
import PasswordStrengthBar from "react-password-strength-bar";

type CreateVaultDetailsProps = {
  providerType?: ProviderType;
  onSubmit?: () => void;
  config?: ProviderConfig;
};

export function CreateVaultDetails({
  providerType,
  onSubmit,
  config,
}: CreateVaultDetailsProps) {
  const { t } = useAppTranslation("vault.createDialog.details");
  const { dark } = useTheme();
  const { localUserName, localHostName } = useProfile();

  const navigate = useNavigate();

  const form = useCreateVaultForm({
    config,
    providerType,
    onSuccess: async (res) => {
      await navigate({
        to: "/app/{-$vaultId}/{-$hostName}/{-$userName}",
        params: {
          vaultId: res.vault.id,
          hostName: localHostName,
          userName: localUserName,
        },
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
        <PasswordStrengthBar
          password={values.password}
          minLength={0}
          barColors={[
            dark ? "#454545" : "#ddd",
            "#ef4836",
            "#f6b44d",
            "#2b90ef",
            "#25c281",
          ]}
          scoreWordStyle={{ display: "none" }}
        />
      </div>
      <form.AppField
        name="confirmPassword"
        validators={{
          onChangeListenTo: ["password"],
          onChange: ({ value, fieldApi }) => {
            if (value !== fieldApi.form.getFieldValue("password"))
              return { type: "custom", code: "password_mismatch" };

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
