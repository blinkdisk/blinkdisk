import { useStore } from "@blinkdisk/forms/use-app-form";
import { useAppTranslation } from "@blinkdisk/hooks/use-app-translation";
import type { ZCreateFolderFormType } from "@blinkdisk/schemas/folder";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@blinkdisk/ui/dialog";
import { ExceedingAlert } from "@desktop/components/dialogs/create-folder/exceeding-alert";
import { CreateFolderGeneral } from "@desktop/components/dialogs/create-folder/general";
import { useCreateFolderForm } from "@desktop/hooks/forms/use-create-folder-form";
import { useCreateFolder } from "@desktop/hooks/mutations/core/use-create-folder";
import { useCreateFolderDraftPolicy } from "@desktop/hooks/mutations/core/use-create-folder-draft-policy";
import { useCreateFolderDialog } from "@desktop/hooks/state/use-create-folder-dialog";
import { useLocalProfile } from "@desktop/hooks/use-local-profile";
import { useCallback, useRef, useState } from "react";

type CreateFolderAction = "CREATE" | "POLICY";

export function CreateFolderDialog() {
  const { t } = useAppTranslation("folder.createDialog");
  const { localHostName, localUserName } = useLocalProfile();

  const { isOpen, setIsOpen, defaultValues, clearDefaultValues } =
    useCreateFolderDialog();

  const actionRef = useRef<CreateFolderAction>("CREATE");
  const [alertShown, setAlertShown] = useState(false);
  const [pendingValues, setPendingValues] =
    useState<ZCreateFolderFormType | null>(null);

  const onSuccess = useCallback(() => {
    setIsOpen(false);
  }, [setIsOpen]);

  const { mutateAsync: createFolder, isPending: isCreatingFolder } =
    useCreateFolder({
      onError: (error) => {
        if (
          error &&
          typeof error === "object" &&
          "message" in error &&
          error.message === "FOLDER_TOO_LARGE"
        ) {
          setAlertShown(true);
        }
      },
      onSuccess,
    });

  const { mutateAsync: createDraft, isPending: isCreatingDraft } =
    useCreateFolderDraftPolicy({
      onSuccess,
    });

  const form = useCreateFolderForm({
    defaultValues,
    onSubmit: async ({ value }) => {
      if (actionRef.current === "POLICY") {
        await createDraft({
          ...value,
          hostName: localHostName,
          userName: localUserName,
        });
        return;
      }

      setPendingValues(value);
      await createFolder({ ...value, size: null });
    },
  });

  const values = useStore(form.store, (state) => state.values);

  const reset = useCallback(() => {
    form.reset();
    clearDefaultValues();
    setAlertShown(false);
    setPendingValues(null);
    actionRef.current = "CREATE";
  }, [form, clearDefaultValues]);

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen} onClosed={reset}>
      <DialogContent className="block max-h-[80vh] max-w-115 overflow-y-auto">
        <DialogTitle>{t("title")}</DialogTitle>
        <DialogDescription className="sr-only">
          {t("description")}
        </DialogDescription>
        <CreateFolderGeneral
          form={form}
          values={values}
          isCreatingFolder={isCreatingFolder}
          isCreatingDraft={isCreatingDraft}
          onAction={(action) => {
            actionRef.current = action;
          }}
        />
        <ExceedingAlert
          open={alertShown}
          setOpen={setAlertShown}
          loading={isCreatingFolder}
          submit={() =>
            pendingValues &&
            createFolder({ ...pendingValues, force: true, size: null })
          }
        />
      </DialogContent>
    </Dialog>
  );
}
