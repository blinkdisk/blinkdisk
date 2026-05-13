import { useAppTranslation } from "@blinkdisk/hooks/use-app-translation";
import { Button } from "@blinkdisk/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@blinkdisk/ui/dialog";
import { CreateVaultConfig } from "@desktop/components/dialogs/create-vault/config";
import { CreateVaultDetails } from "@desktop/components/dialogs/create-vault/details";
import { CreateVaultProviders } from "@desktop/components/dialogs/create-vault/providers";
import { CreateVaultVariant } from "@desktop/components/dialogs/create-vault/variant";
import { useVaultList } from "@desktop/hooks/queries/use-vault-list";
import {
  CreateVaultStep,
  useCreateVaultDialog,
} from "@desktop/hooks/state/use-create-vault-dialog";
import { ArrowLeftIcon } from "lucide-react";
import { useCallback } from "react";

const backButton: Record<CreateVaultStep, CreateVaultStep> = {
  VARIANT: "VARIANT",
  PROVIDER: "VARIANT",
  CONFIG: "PROVIDER",
  DETAILS: "CONFIG",
};

export function CreateVaultDialog() {
  const { t } = useAppTranslation("vault.createDialog");
  const { data: vaults } = useVaultList();
  const { isOpen, setIsOpen, options, setOptions, resetOptions } =
    useCreateVaultDialog();
  const { step, provider, config, autoSelectedProvider } = options;

  const close = useCallback(() => {
    setIsOpen(false);
  }, [setIsOpen]);

  const reset = useCallback(() => {
    resetOptions();
  }, [resetOptions]);

  const showFirstVaultTitle = !vaults?.length;

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen} onClosed={reset}>
      <DialogContent className="w-120 block max-h-[80vh] overflow-y-auto">
        <div className="flex items-center gap-3">
          {step !== "VARIANT" && !autoSelectedProvider ? (
            <Button
              onClick={() => {
                if (step === "DETAILS" && provider == "CLOUDBLINK")
                  setOptions({
                    step: "VARIANT",
                    autoSelectedProvider: false,
                  });
                else
                  setOptions({
                    step: backButton[step],
                    autoSelectedProvider: false,
                  });
              }}
              variant="ghost"
              size="icon-xs"
            >
              <ArrowLeftIcon />
            </Button>
          ) : null}
          <DialogTitle>
            {showFirstVaultTitle ? t("title.first") : t("title.default")}
          </DialogTitle>
        </div>
        <DialogDescription className="sr-only">
          {t("description")}
        </DialogDescription>
        {step === "VARIANT" ? (
          <CreateVaultVariant
            selectCloud={() => {
              setOptions({
                provider: "CLOUDBLINK",
                config: undefined,
                step: "DETAILS",
                autoSelectedProvider: false,
              });
            }}
            selectCustom={() =>
              setOptions({ step: "PROVIDER", autoSelectedProvider: false })
            }
          />
        ) : step === "PROVIDER" ? (
          <CreateVaultProviders
            selectProvider={(newProvider) => {
              setOptions({
                provider: newProvider,
                config: provider !== newProvider ? undefined : config,
                step: "CONFIG",
                autoSelectedProvider: false,
              });
            }}
          />
        ) : step === "CONFIG" ? (
          <CreateVaultConfig
            config={config}
            provider={provider}
            onSubmit={(config) => {
              setOptions({
                config,
                step: "DETAILS",
                autoSelectedProvider: false,
              });
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
            autoSelectedProvider={autoSelectedProvider}
            onChangeStorage={() =>
              setOptions({
                step: "VARIANT",
                autoSelectedProvider: false,
              })
            }
          />
        ) : null}
      </DialogContent>
    </Dialog>
  );
}
