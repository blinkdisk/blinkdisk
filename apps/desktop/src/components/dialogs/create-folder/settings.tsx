import { ExceedingAlert } from "#components/dialogs/create-folder/exceeding-alert";
import { FolderSize } from "#components/dialogs/create-folder/size";
import { CompressionSettings } from "#components/policy/compression";
import { PolicyContextProvider } from "#components/policy/context";
import { FilesSettings } from "#components/policy/files";
import { RetentionSettings } from "#components/policy/retention";
import { ScheduleSettings } from "#components/policy/schedule";
import { useCreateFolder } from "#hooks/mutations/core/use-create-folder";
import { useAppTranslation } from "@blinkdisk/hooks/use-app-translation";
import { ZCreateFolderFormType } from "@blinkdisk/schemas/folder";
import { Accordion } from "@blinkdisk/ui/accordion";
import { Button } from "@blinkdisk/ui/button";
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
              className="mt-2 w-full"
              value={loading ? [] : open}
              onValueChange={setOpen}
              multiple
            >
              <ScheduleSettings />
              <RetentionSettings />
              <FilesSettings />
              <CompressionSettings />
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
