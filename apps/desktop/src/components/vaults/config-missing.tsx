import { providerForms } from "@desktop/components/forms/providers";
import { useAddVaultConfig } from "@desktop/hooks/mutations/use-add-vault-config";
import { VaultItem } from "@desktop/hooks/queries/use-vault";
import { useAppTranslation } from "@hooks/use-app-translation";
import { SettingsIcon } from "lucide-react";
import { useMemo } from "react";

interface ConfigMissingProps {
  vault: VaultItem;
}

export function ConfigMissing({ vault }: ConfigMissingProps) {
  const { t } = useAppTranslation("vault.configMissing");

  const { mutateAsync: addVaultConfig } = useAddVaultConfig();

  const Form = useMemo(
    () => (vault ? providerForms[vault.provider] : null),
    [vault],
  );

  return (
    <div className="flex h-full w-full flex-col items-center overflow-y-auto py-12">
      <div className="mt-auto"></div>
      <div className="sm:w-95 flex flex-col items-center justify-center">
        <div className="bg-muted flex size-14 items-center justify-center rounded-xl border">
          <SettingsIcon className="text-muted-foreground size-6" />
        </div>
        <h1 className="mt-6 text-3xl font-bold">{t("title")}</h1>
        <p className="text-muted-foreground mt-2 text-center">
          {t("description")}
        </p>
        <div className="mt-12 w-full">
          {Form && (
            <Form
              action="CONNECT"
              coreId={vault?.coreId}
              onSubmit={(config) =>
                config &&
                vault &&
                addVaultConfig({
                  config,
                  vaultId: vault.id,
                  name: vault.name,
                  provider: vault.provider,
                })
              }
            />
          )}
        </div>
      </div>
      <div className="mb-auto"></div>
    </div>
  );
}
