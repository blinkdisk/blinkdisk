import { providerForms } from "#components/forms/providers";
import { SettingsCategory } from "#components/policy/category";
import { useVault } from "#hooks/queries/use-vault";
import { useVaultConfig } from "#hooks/queries/use-vault-config";
import { FormDisabledContext } from "@blinkdisk/forms/use-app-form";
import { useAppTranslation } from "@blinkdisk/hooks/use-app-translation";
import { HardDriveIcon } from "lucide-react";
import { useMemo } from "react";

export function VaultConfigSettings() {
  const { t } = useAppTranslation("settings.vault.config");

  const { data: vault } = useVault();
  const { data: config } = useVaultConfig();

  const Form = useMemo(
    () => (vault ? providerForms[vault.provider] : null),
    [vault],
  );

  if (!vault || vault.provider === "CLOUDBLINK") return null;
  return (
    <SettingsCategory
      id="config"
      title={t("title")}
      description={t("description")}
      icon={<HardDriveIcon />}
    >
      <FormDisabledContext.Provider value={true}>
        {Form && config && (
          <Form
            action="UPDATE"
            // @ts-expect-error Find a better way to type this
            config={config}
            onSubmit={() => null}
          />
        )}
      </FormDisabledContext.Provider>
    </SettingsCategory>
  );
}
