import { useStore } from "@blinkdisk/forms/use-app-form";
import { useAppTranslation } from "@blinkdisk/hooks/use-app-translation";
import type { ZCreateSourceFormType } from "@blinkdisk/schemas/source";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@blinkdisk/ui/dialog";
import { ExceedingAlert } from "@desktop/components/dialogs/create-source/exceeding-alert";
import { CreateSourceGeneral } from "@desktop/components/dialogs/create-source/general";
import { useCreateSourceForm } from "@desktop/hooks/forms/use-create-source-form";
import { useCreateSource } from "@desktop/hooks/mutations/core/use-create-source";
import { useCreateSourceDraftPolicy } from "@desktop/hooks/mutations/core/use-create-source-draft-policy";
import { useCreateSourceDialog } from "@desktop/hooks/state/use-create-source-dialog";
import { useLocalProfile } from "@desktop/hooks/use-local-profile";
import { useRef, useState } from "react";

type CreateSourceAction = "CREATE" | "POLICY";

export function CreateSourceDialog() {
  const { t } = useAppTranslation("folder.createDialog");
  const { localHostName, localUserName } = useLocalProfile();

  const { isOpen, setIsOpen, defaultValues, clearDefaultValues } =
    useCreateSourceDialog();

  const actionRef = useRef<CreateSourceAction>("CREATE");
  const [alertShown, setAlertShown] = useState(false);
  const [pendingValues, setPendingValues] =
    useState<ZCreateSourceFormType | null>(null);

  const onSuccess = () => {
    setIsOpen(false);
  };

  const { mutateAsync: createSource, isPending: isCreatingSource } =
    useCreateSource({
      onError: (error) => {
        if (
          error &&
          typeof error === "object" &&
          "message" in error &&
          error.message === "SOURCE_TOO_LARGE"
        ) {
          setAlertShown(true);
        }
      },
      onSuccess,
    });

  const { mutateAsync: createDraft, isPending: isCreatingDraft } =
    useCreateSourceDraftPolicy({
      onSuccess,
    });

  const form = useCreateSourceForm({
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
      await createSource({ ...value, size: null });
    },
  });

  const values = useStore(form.store, (state) => state.values);

  const reset = () => {
    form.reset();
    clearDefaultValues();
    setAlertShown(false);
    setPendingValues(null);
    actionRef.current = "CREATE";
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen} onClosed={reset}>
      <DialogContent className="block max-h-[80vh] max-w-115 overflow-y-auto">
        <DialogTitle>{t("title")}</DialogTitle>
        <DialogDescription className="sr-only">
          {t("description")}
        </DialogDescription>
        <CreateSourceGeneral
          form={form}
          values={values}
          isCreatingSource={isCreatingSource}
          isCreatingDraft={isCreatingDraft}
          onAction={(action) => {
            actionRef.current = action;
          }}
        />
        <ExceedingAlert
          open={alertShown}
          setOpen={setAlertShown}
          loading={isCreatingSource}
          submit={() =>
            pendingValues &&
            createSource({ ...pendingValues, force: true, size: null })
          }
        />
      </DialogContent>
    </Dialog>
  );
}
