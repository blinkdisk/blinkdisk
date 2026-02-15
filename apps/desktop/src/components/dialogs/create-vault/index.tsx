import { ProviderType } from "@config/providers";
import { CreateVaultConfig } from "@desktop/components/dialogs/create-vault/config";
import { CreateVaultDetails } from "@desktop/components/dialogs/create-vault/details";
import { CreateVaultProviders } from "@desktop/components/dialogs/create-vault/providers";
import { CreateVaultVariant } from "@desktop/components/dialogs/create-vault/variant";
import { useCreateVaultDialog } from "@desktop/hooks/state/use-create-vault-dialog";
import { useAppTranslation } from "@hooks/use-app-translation";
import { ProviderConfig } from "@schemas/providers";
import { Button } from "@ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@ui/dialog";
import { ArrowLeftIcon } from "lucide-react";
import { useCallback, useState } from "react";

type CreateVaultStep = "VARIANT" | "PROVIDER" | "CONFIG" | "DETAILS";

const backButton: Record<CreateVaultStep, CreateVaultStep> = {
  VARIANT: "VARIANT",
  PROVIDER: "VARIANT",
  CONFIG: "PROVIDER",
  DETAILS: "CONFIG",
};

export function CreateVaultDialog() {
  const { t } = useAppTranslation("vault.createDialog");

  const [step, setStep] = useState<CreateVaultStep>("VARIANT");
  const [provider, setProvider] = useState<ProviderType | undefined>();
  const [config, setConfig] = useState<ProviderConfig | undefined>();
  const { isOpen, setIsOpen } = useCreateVaultDialog();

  const close = useCallback(() => {
    setIsOpen(false);
  }, [setIsOpen]);

  const reset = useCallback(() => {
    setStep("VARIANT");
    setProvider(undefined);
    setConfig(undefined);
  }, [setStep, setProvider, setConfig]);

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen} onClosed={reset}>
      <DialogContent className="w-120 block max-h-[80vh] overflow-y-auto">
        <div className="flex items-center gap-3">
          {step !== "VARIANT" ? (
            <Button
              onClick={() => {
                if (step === "DETAILS" && provider == "CLOUDBLINK")
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
              setProvider("CLOUDBLINK");
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
            onSubmit={() => {
              close();
              setTimeout(reset, 100);
            }}
            config={config}
          />
        ) : null}
      </DialogContent>
    </Dialog>
  );
}
