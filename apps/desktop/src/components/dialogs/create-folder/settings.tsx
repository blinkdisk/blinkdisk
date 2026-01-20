import { ExceedingAlert } from "@desktop/components/dialogs/create-folder/exceeding-alert";
import { FolderSize } from "@desktop/components/dialogs/create-folder/size";
import { PolicyContextProvider } from "@desktop/components/policy/context";
import { FilesSettings } from "@desktop/components/policy/files";
import { RetentionSettings } from "@desktop/components/policy/retention";
import { ScheduleSettings } from "@desktop/components/policy/schedule";
import { useCreateFolder } from "@desktop/hooks/mutations/core/use-create-folder";
import { useAppTranslation } from "@hooks/use-app-translation";
import { ZCreateFolderFormType } from "@schemas/folder";
import { Accordion } from "@ui/accordion";
import { Button } from "@ui/button";
import { useState } from "react";

type CreateFolderSettingsProps = {
  values: ZCreateFolderFormType;
  onSuccess: () => void;
};

export function CreateFolderSettings({
  values,
  onSuccess,
}: CreateFolderSettingsProps) {
  const { t } = useAppTranslation("folder.createDialog");

  const [size, setSize] = useState<number | null>(null);
  const [alertShown, setAlertShown] = useState(false);
  const [open, setOpen] = useState<string[]>([]);

  const { mutateAsync, isPending } = useCreateFolder({
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

  return (
    <>
      <PolicyContextProvider level="FOLDER" mock={{ path: values.path }}>
        {({ loading }) => (
          <>
            <Accordion
              type="multiple"
              className="mt-2 w-full"
              value={loading ? [] : open}
              onValueChange={setOpen}
            >
              <ScheduleSettings />
              <RetentionSettings />
              <FilesSettings />
            </Accordion>
            <FolderSize path={values.path} setSize={setSize} />
          </>
        )}
      </PolicyContextProvider>
      <Button
        onClick={() => mutateAsync({ ...values, size })}
        loading={isPending}
        className="mt-4 w-full"
      >
        {t("submit")}
      </Button>

      <ExceedingAlert
        open={alertShown}
        setOpen={setAlertShown}
        loading={isPending}
        submit={() => mutateAsync({ ...values, force: true, size })}
      />
    </>
  );
}
