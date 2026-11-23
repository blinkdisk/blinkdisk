import { useStore } from "@blinkdisk/forms/use-app-form";
import { useAppTranslation } from "@blinkdisk/hooks/use-app-translation";
import { Checkbox } from "@blinkdisk/ui/checkbox";
import { PasswordStrengthMeter } from "@desktop/components/dialogs/create-vault/details";
import {
  OnboardingHeading,
  OnboardingSection,
} from "@desktop/components/onboarding/step";
import { useCreateVaultForm } from "@desktop/hooks/forms/use-create-vault-form";
import { useOnboardingFolders } from "@desktop/hooks/queries/use-onboarding-folders";
import { useOnboarding } from "@desktop/hooks/state/use-onboarding";
import { useAccountId } from "@desktop/hooks/use-account-id";
import { useFirstBackup } from "@desktop/hooks/use-first-backup";
import { useTheme } from "@desktop/hooks/use-theme";
import { useNavigate } from "@tanstack/react-router";
import { TriangleAlertIcon } from "lucide-react";
import { useState } from "react";

export function OnboardingPassword() {
  const { t } = useAppTranslation("onboarding.password");
  const { dark } = useTheme();
  const { accountId } = useAccountId();
  const { storage, provider, config } = useOnboarding();
  const { selected } = useOnboardingFolders();
  const { startFirstBackup } = useFirstBackup();
  const navigate = useNavigate();

  const [hasSavedPassword, setHasSavedPassword] = useState(false);

  const form = useCreateVaultForm({
    providerType: storage === "CLOUDBLINK" ? "CLOUDBLINK" : provider,
    config: storage === "CLOUDBLINK" ? undefined : config,
    onSuccess: async ({ vaultId }) => {
      if (!accountId) return;

      await window.electron.store.set("onboarding.vaultId", vaultId);
      void startFirstBackup(vaultId, selected);

      await navigate({
        to: "/onboarding/$accountId/$vaultId",
        params: { accountId, vaultId },
        replace: true,
      });
    },
  });

  const password = useStore(form.store, (store) => store.values.password);

  return (
    <>
      <OnboardingHeading title={t("title")} description={t("description")} />
      <OnboardingSection className="mt-8">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            form.handleSubmit(e);
          }}
          className="flex flex-col gap-5"
        >
          <div className="flex flex-col gap-2">
            <form.AppField name="password">
              {(field) => (
                <field.Password
                  autoFocus
                  label={{ title: t("password.label") }}
                  placeholder={t("password.placeholder")}
                />
              )}
            </form.AppField>
            <PasswordStrengthMeter dark={dark} password={password || ""} />
          </div>
          <form.AppField
            name="confirmPassword"
            validators={{
              onChangeListenTo: ["password"],
              onChange: ({ value, fieldApi }) =>
                value !== fieldApi.form.getFieldValue("password")
                  ? { code: "custom", message: "password_mismatch" }
                  : undefined,
            }}
          >
            {(field) => (
              <field.Password
                label={{ title: t("confirmPassword.label") }}
                placeholder={t("confirmPassword.placeholder")}
              />
            )}
          </form.AppField>
          <div className="rounded-xl border border-amber-500/30 bg-amber-500/5 p-4">
            <div className="flex gap-3">
              <TriangleAlertIcon className="mt-0.5 size-4 shrink-0 text-amber-600 dark:text-amber-500" />
              <div>
                <p className="text-sm font-medium text-amber-700 dark:text-amber-500">
                  {t("warning.title")}
                </p>
                <p className="text-muted-foreground mt-1 text-xs leading-relaxed">
                  {t("warning.description")}
                </p>
              </div>
            </div>
            <label
              htmlFor="has-saved-password"
              className="mt-4 flex items-center gap-3 border-t border-amber-500/20 pt-4 text-sm font-medium"
            >
              <Checkbox
                id="has-saved-password"
                checked={hasSavedPassword}
                onCheckedChange={(checked) => setHasSavedPassword(!!checked)}
              />
              {t("warning.confirm")}
            </label>
          </div>
          <form.AppForm>
            <form.Submit size="lg" disabled={!hasSavedPassword}>
              {t("submit")}
            </form.Submit>
          </form.AppForm>
        </form>
      </OnboardingSection>
    </>
  );
}
