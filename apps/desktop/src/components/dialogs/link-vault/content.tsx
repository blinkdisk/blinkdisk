import { LinkVaultConfig } from "@desktop/components/dialogs/link-vault/config";
import { LinkVaultDetails } from "@desktop/components/dialogs/link-vault/details";
import { LinkVaultList } from "@desktop/components/dialogs/link-vault/list";
import { LinkVaultPassword } from "@desktop/components/dialogs/link-vault/password";
import { UnlinkedVaultItem } from "@desktop/hooks/queries/use-unlinked-vaults";
import { useVaultConfig } from "@desktop/hooks/queries/use-vault-config";
import { useAppTranslation } from "@hooks/use-app-translation";
import { ProviderConfig } from "@schemas/providers";
import { Button } from "@ui/button";
import { DialogDescription, DialogTitle } from "@ui/dialog";
import { ArrowLeftIcon } from "lucide-react";
import { useCallback, useState } from "react";

type LinkVaultStep = "LIST" | "PASSWORD" | "CONFIG" | "DETAILS";

const backButton: Record<LinkVaultStep, LinkVaultStep> = {
  LIST: "LIST",
  PASSWORD: "LIST",
  CONFIG: "LIST",
  DETAILS: "LIST",
};

type LinkVaultDialogContentProps = {
  onBack?: () => void;
  onSubmit?: () => void;
};

export function LinkVaultDialogContent({
  onBack,
  onSubmit,
}: LinkVaultDialogContentProps) {
  const { t } = useAppTranslation("vault.linkDialog");

  const [vault, setVault] = useState<UnlinkedVaultItem | undefined>();
  const [step, setStep] = useState<LinkVaultStep>("LIST");
  const [password, setPassword] = useState<string | undefined>();
  const [config, setConfig] = useState<ProviderConfig | undefined>();

  const onSelectVault = useCallback(async (vault: UnlinkedVaultItem) => {
    setVault(vault);

    const password = await window.electron.vault.password.get({
      storageId: vault.storageId,
    });

    if (password) {
      setPassword(password);

      if (vault.configLevel === "PROFILE") setStep("CONFIG");
      else setStep("DETAILS");
    } else {
      setPassword(undefined);
      setStep("PASSWORD");
    }
  }, []);

  const { data: initialConfig } = useVaultConfig(vault, password);

  return (
    <>
      <div className="flex items-center gap-3">
        {step !== "LIST" || onBack ? (
          <Button
            onClick={() => {
              if (step === "LIST" && onBack) onBack();
              setStep(backButton[step]);
            }}
            variant="ghost"
            size="icon-xs"
          >
            <ArrowLeftIcon />
          </Button>
        ) : null}
        <DialogTitle>{t("title")}</DialogTitle>
      </div>
      <DialogDescription className="sr-only">
        {t("description")}
      </DialogDescription>
      <div className="mt-6">
        {step === "LIST" ? (
          <LinkVaultList onSelectVault={onSelectVault} />
        ) : step === "PASSWORD" ? (
          <LinkVaultPassword
            passwordHash={vault?.passwordHash}
            onSubmit={async (values) => {
              if (!vault) return;

              setPassword(values.password);

              await window.electron.vault.password.set({
                storageId: vault?.storageId,
                password: values.password,
              });

              if (vault.configLevel === "PROFILE") setStep("CONFIG");
              else setStep("DETAILS");
            }}
          />
        ) : step === "CONFIG" ? (
          <LinkVaultConfig
            vault={vault}
            config={initialConfig}
            onSubmit={(config) => {
              setConfig(config);
              setStep("DETAILS");
            }}
          />
        ) : step === "DETAILS" ? (
          <LinkVaultDetails
            config={config}
            vault={vault}
            password={password}
            onSubmit={onSubmit}
          />
        ) : null}
      </div>
    </>
  );
}
