import { ExceedingAlert } from "@desktop/components/dialogs/create-folder/exceeding-alert";
import { FilesSettings } from "@desktop/components/policy/files";
import { RetentionSettings } from "@desktop/components/policy/retention";
import { ScheduleSettings } from "@desktop/components/policy/schedule";
import { useCreateFolder } from "@desktop/hooks/mutations/core/use-create-folder";
import { usePolicyContext } from "@desktop/hooks/use-policy-context";
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

  const [alertShown, setAlertShown] = useState(false);

  const { mutateAsync, isPending } = useCreateFolder({
    onError: (error) => {
      if (error.message === "FOLDER_TOO_LARGE") {
        setAlertShown(true);
      }
    },
    onSuccess,
  });

  const context = usePolicyContext({
    level: "FOLDER",
    mock: true,
  });

  return (
    <>
      <Accordion type="multiple" className="mt-2 w-full">
        <ScheduleSettings context={context} />
        <RetentionSettings context={context} />
        <FilesSettings context={context} />
      </Accordion>
      <Button
        onClick={() => mutateAsync({ ...values })}
        loading={isPending}
        className="mt-4 w-full"
      >
        {t("submit")}
      </Button>

      <ExceedingAlert
        open={alertShown}
        setOpen={setAlertShown}
        loading={isPending}
        submit={() => mutateAsync({ ...values, force: true })}
      />
    </>
  );
}
