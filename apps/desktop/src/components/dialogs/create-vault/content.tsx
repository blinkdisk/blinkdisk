import { ProviderType } from "@config/providers";
import { CreateVaultConfig } from "@desktop/components/dialogs/create-vault/config";
import { CreateVaultDetails } from "@desktop/components/dialogs/create-vault/details";
import { CreateVaultProviders } from "@desktop/components/dialogs/create-vault/providers";
import { CreateVaultVariant } from "@desktop/components/dialogs/create-vault/variant";
import { useAppTranslation } from "@hooks/use-app-translation";
import { ProviderConfig } from "@schemas/providers";
import { Button } from "@ui/button";
import { DialogDescription, DialogTitle } from "@ui/dialog";
import { ArrowLeftIcon } from "lucide-react";
import { useState } from "react";

type CreateVaultStep = "VARIANT" | "PROVIDER" | "CONFIG" | "DETAILS";

const backButton: Record<CreateVaultStep, CreateVaultStep> = {
  VARIANT: "VARIANT",
  PROVIDER: "VARIANT",
  CONFIG: "PROVIDER",
  DETAILS: "CONFIG",
};

export type CreateVaultDialogContentProps = {
  onBack?: () => void;
  onSubmit?: () => void;
  canGoBack?: boolean;
};

export function CreateVaultDialogContent({
  onBack,
  onSubmit,
  canGoBack,
}: CreateVaultDialogContentProps) {
  const { t } = useAppTranslation("vault.createDialog");

  const [step, setStep] = useState<CreateVaultStep>("VARIANT");
  const [provider, setProvider] = useState<ProviderType | undefined>();
  const [config, setConfig] = useState<ProviderConfig | undefined>();

  return (
    <>
      <div className="flex items-center gap-3">
        {step !== "VARIANT" || (onBack && canGoBack) ? (
          <Button
            onClick={() => {
              if (step === "VARIANT" && onBack && canGoBack) onBack();
              else if (step === "DETAILS" && provider == "BLINKDISK_CLOUD")
                setStep("VARIANT");
              else setStep(backButton[step]);
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
      {step === "VARIANT" ? (
        <CreateVaultVariant
          selectCloud={() => {
            setProvider("BLINKDISK_CLOUD");
            setConfig(undefined);
            setStep("DETAILS");
          }}
          selectCustom={() => setStep("PROVIDER")}
        />
      ) : step === "PROVIDER" ? (
        <CreateVaultProviders
          selectProvider={(newProvider) => {
            if (provider !== newProvider) setConfig(undefined);
            setProvider(newProvider);
            setStep("CONFIG");
          }}
        />
      ) : step === "CONFIG" ? (
        <CreateVaultConfig
          config={config}
          provider={provider}
          onSubmit={(config) => {
            setConfig(config);
            setStep("DETAILS");
          }}
        />
      ) : step === "DETAILS" ? (
        <CreateVaultDetails
          providerType={provider}
          onSubmit={onSubmit}
          config={config}
        />
      ) : null}
    </>
  );
}
