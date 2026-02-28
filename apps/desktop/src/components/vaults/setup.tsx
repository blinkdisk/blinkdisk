import { useSetupPasswordForm } from "@desktop/hooks/forms/use-setup-password-form";
import { useSetupVault } from "@desktop/hooks/mutations/use-setup-vault";
import { useVault } from "@desktop/hooks/queries/use-vault";
import { useVaultConfig } from "@desktop/hooks/queries/use-vault-config";
import { useAppTranslation } from "@hooks/use-app-translation";
import { ProviderConfig } from "@schemas/providers";
import { SettingsIcon } from "lucide-react";
import { useMemo, useState } from "react";
import { providerForms } from "../forms/providers";

export type SetupStep = "PASSWORD" | "CONFIG";

export function Setup() {
  const { t } = useAppTranslation("vault.setup");
  const { data: vault } = useVault();

  const [step, setStep] = useState<SetupStep>("PASSWORD");

  const [password, setPassword] = useState("");
  const [config, setConfig] = useState<ProviderConfig | null>(null);

  const { data: loadedConfig } = useVaultConfig();

  const { mutateAsync } = useSetupVault({
    setStep,
  });

  const form = useSetupPasswordForm({
    vaultId: vault?.id,
    onSubmit: async ({ value }) => {
      if (!vault) return;

      setPassword(value.password);

      await mutateAsync({
        vault,
        config,
        password: value.password,
      });
    },
  });

  const ConfigForm = useMemo(
    () => (vault ? providerForms[vault.provider] : null),
    [vault],
  );

  return (
    <div className="flex h-full w-full flex-col items-center overflow-y-auto py-12">
      <div className="mt-auto"></div>
      <div className="flex flex-col items-center justify-center sm:w-80">
        <div className="bg-muted flex size-14 items-center justify-center rounded-xl border">
          <SettingsIcon className="text-muted-foreground size-6" />
        </div>
        <h1 className="mt-6 text-4xl font-bold">{t("title")}</h1>
        <p className="text-muted-foreground mt-3 text-center text-sm">
          {t("description")}
        </p>
        {step === "PASSWORD" ? (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              form.handleSubmit(e);
            }}
            className="mt-8 flex w-full flex-col gap-6"
          >
            <form.AppField name="password">
              {(field) => (
                <field.Password
                  label={{ title: t("password.label") }}
                  placeholder={t("password.placeholder")}
                />
              )}
            </form.AppField>
            <form.AppForm>
              <form.Submit>{t("submit")}</form.Submit>
            </form.AppForm>
          </form>
        ) : step === "CONFIG" ? (
          <div className="mt-12 w-full">
            {ConfigForm && (
              <ConfigForm
                action="SETUP"
                // eslint-disable-next-line
                config={loadedConfig as any}
                onSubmit={async (config) => {
                  setConfig(config);

                  if (!vault) return;

                  await mutateAsync({
                    vault,
                    config,
                    password,
                  });
                }}
              />
            )}
          </div>
        ) : null}
      </div>
      <div className="mb-auto"></div>
    </div>
  );
}
