import { providerForms } from "@desktop/components/forms/providers";
import { SettingsCategory } from "@desktop/components/policy/category";
import { useVault } from "@desktop/hooks/queries/use-vault";
import { useVaultConfig } from "@desktop/hooks/queries/use-vault-config";
import { useVaultPassword } from "@desktop/hooks/queries/use-vault-password";
import { FormDisabledContext } from "@hooks/use-app-form";
import { useAppTranslation } from "@hooks/use-app-translation";
import { HardDriveIcon } from "lucide-react";
import { useMemo } from "react";

export function VaultConfigSettings() {
  const { t } = useAppTranslation("settings.vault.config");

  const { data: vault } = useVault();
  const { data: password } = useVaultPassword(vault);
  const { data: config } = useVaultConfig(vault, password);

  const Form = useMemo(
    () => (vault ? providerForms[vault.provider] : null),
    [vault],
  );

  if (!vault || vault.provider === "BLINKDISK_CLOUD") return null;
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
