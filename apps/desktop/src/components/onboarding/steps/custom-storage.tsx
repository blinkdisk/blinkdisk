import { resolveStorageProviderType } from "@blinkdisk/constants/providers";
import { useAppTranslation } from "@blinkdisk/hooks/use-app-translation";
import { CreateVaultConfig } from "@desktop/components/dialogs/create-vault/config";
import { CreateVaultProviders } from "@desktop/components/dialogs/create-vault/providers";
import {
  OnboardingHeading,
  OnboardingSection,
} from "@desktop/components/onboarding/step";
import { useOnboarding } from "@desktop/hooks/state/use-onboarding";

export function OnboardingProvider() {
  const { t } = useAppTranslation("onboarding.provider");
  const { selectProvider } = useOnboarding();

  return (
    <>
      <OnboardingHeading title={t("title")} description={t("description")} />
      <OnboardingSection>
        <CreateVaultProviders selectProvider={selectProvider} />
      </OnboardingSection>
    </>
  );
}

export function OnboardingConfig() {
  const { t } = useAppTranslation("onboarding.config");
  const { t: tProvider } = useAppTranslation("vault.providers");
  const { provider, config, submitConfig } = useOnboarding();

  return (
    <>
      <OnboardingHeading
        title={t("title", {
          provider: provider
            ? tProvider(`${resolveStorageProviderType(provider)}.name`)
            : "",
        })}
        description={t("description")}
      />
      <OnboardingSection>
        <CreateVaultConfig
          provider={provider}
          config={config}
          onSubmit={submitConfig}
        />
      </OnboardingSection>
    </>
  );
}
