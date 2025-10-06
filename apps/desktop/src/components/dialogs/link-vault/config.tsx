import { providerForms } from "@desktop/components/forms/providers";
import { UnlinkedVaultItem } from "@desktop/hooks/queries/use-unlinked-vaults";
import { ProviderConfig } from "@schemas/providers";
import { useMemo } from "react";

export type LinkVaultConfigProps = {
  vault: UnlinkedVaultItem | undefined;
  config: ProviderConfig | null | undefined;
  onSubmit: (config: ProviderConfig) => void;
};

export function LinkVaultConfig({
  vault,
  config,
  onSubmit,
}: LinkVaultConfigProps) {
  const Form = useMemo(
    () => (vault ? providerForms[vault.provider] : null),
    [vault],
  );

  return (
    <div className="mt-8 w-full">
      {Form && (
        <Form
          action="LINK"
          // @ts-expect-error Find a better way to type this
          config={config}
          onSubmit={onSubmit}
          storageId={vault?.storageId}
        />
      )}
    </div>
  );
}
