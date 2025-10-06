import { ProviderType } from "@config/providers";
import { providerForms } from "@desktop/components/forms/providers";
import { ProviderConfig } from "@schemas/providers";
import { useMemo } from "react";

export type CreateVaultConfigProps = {
  config?: ProviderConfig;
  provider: ProviderType | undefined;
  onSubmit: (config: ProviderConfig) => void;
};

export function CreateVaultConfig({
  config,
  provider,
  onSubmit,
}: CreateVaultConfigProps) {
  const Form = useMemo(
    () => (provider ? providerForms[provider] : null),
    [provider],
  );

  return (
    <div className="mt-8 w-full">
      {Form && (
        <Form
          action="CREATE"
          // @ts-expect-error Find a better way to type this
          config={config}
          onSubmit={onSubmit}
        />
      )}
    </div>
  );
}
