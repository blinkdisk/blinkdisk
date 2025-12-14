import { CreateFolderGeneral } from "@desktop/components/dialogs/create-folder/general";
import { CreateFolderSettings } from "@desktop/components/dialogs/create-folder/settings";
import { useCreateFolderForm } from "@desktop/hooks/forms/use-create-folder-form";
import { useCreateFolderDialog } from "@desktop/hooks/state/use-create-folder-dialog";
import { useStore } from "@hooks/use-app-form";
import { useAppTranslation } from "@hooks/use-app-translation";
import { Button } from "@ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@ui/dialog";
import { ArrowLeftIcon } from "lucide-react";
import { useCallback, useState } from "react";

type CreateFolderStep = "GENERAL" | "SETTINGS";

export function CreateFolderDialog() {
  const { t } = useAppTranslation("folder.createDialog");

  const { isOpen, setIsOpen, defaultValues, clearDefaultValues } =
    useCreateFolderDialog();

  const [step, setStep] = useState<CreateFolderStep>("GENERAL");

  const form = useCreateFolderForm({
    defaultValues,
    onSubmit: () => {
      setStep("SETTINGS");
    },
  });

  const values = useStore(form.store, (state) => state.values);

  const reset = useCallback(() => {
    form.reset();
    clearDefaultValues();
    setStep("GENERAL");
    window.folderMockPolicy = undefined;
  }, [form, clearDefaultValues]);

  const onSuccess = useCallback(() => {
    setIsOpen(false);
    reset();
  }, [reset, setIsOpen]);

  return (
    <>
      <Dialog open={isOpen} onOpenChange={setIsOpen} onClosed={reset}>
        <DialogContent className="w-120 block max-h-[80vh] overflow-y-auto">
          <div className="flex items-center gap-3">
            {step !== "GENERAL" ? (
              <Button
                onClick={() => {
                  setStep("GENERAL");
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
          {step === "GENERAL" ? (
            <CreateFolderGeneral form={form} />
          ) : (
            <CreateFolderSettings values={values} onSuccess={onSuccess} />
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
