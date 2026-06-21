import { resolveStorageProviderType } from "@blinkdisk/constants/providers";
import { FormDisabledContext } from "@blinkdisk/forms/use-app-form";
import { useAppTranslation } from "@blinkdisk/hooks/use-app-translation";
import { providerForms } from "@desktop/components/forms/providers";
import { providerIcons } from "@desktop/components/icons/providers";
import {
  SettingsGroup,
  SettingsPanel,
  SettingsRow,
} from "@desktop/components/settings";
import { useVault } from "@desktop/hooks/queries/use-vault";
import { useVaultConfig } from "@desktop/hooks/queries/use-vault-config";
import { useMemo } from "react";

export function VaultConfigSettings() {
  const { t } = useAppTranslation("settings.vault.config");
  const { t: tVault } = useAppTranslation("vault");

  const { data: vault } = useVault();
  const { data: config } = useVaultConfig();
  const displayProviderType = vault
    ? resolveStorageProviderType(vault.provider)
    : null;
  const Icon = displayProviderType ? providerIcons[displayProviderType] : null;

  const Form = useMemo(
    () => (displayProviderType ? providerForms[displayProviderType] : null),
    [displayProviderType],
  );

  if (!vault || vault.provider === "CLOUDBLINK") return null;
  return (
    <SettingsGroup title={t("title")}>
      <SettingsPanel>
        <SettingsRow fullWidth>
          <div className="flex items-center gap-3">
            <div className="bg-muted flex size-10 shrink-0 items-center justify-center rounded-lg border">
              {Icon ? <Icon className="size-5" /> : null}
            </div>
            <div className="min-w-0">
              <p className="text-muted-foreground text-xs">{t("provider")}</p>
              <p className="truncate text-base font-medium">
                {displayProviderType
                  ? tVault(`providers.${displayProviderType}.name`)
                  : null}
              </p>
            </div>
          </div>
        </SettingsRow>
        <SettingsRow fullWidth>
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
        </SettingsRow>
      </SettingsPanel>
    </SettingsGroup>
  );
}
