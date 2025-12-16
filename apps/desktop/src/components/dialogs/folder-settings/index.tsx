import { FolderGeneralSettings } from "@desktop/components/folders/general-settings";
import { PolicyContextProvider } from "@desktop/components/policy/context";
import { FilesSettings } from "@desktop/components/policy/files";
import { RetentionSettings } from "@desktop/components/policy/retention";
import { ScheduleSettings } from "@desktop/components/policy/schedule";
import { ReadOnlyAlert } from "@desktop/components/vaults/readonly-alert";
import { useFolderSettingsDialog } from "@desktop/hooks/state/use-folder-settings-dialog";
import { useProfile } from "@desktop/hooks/use-profile";
import { FormDisabledContext } from "@hooks/use-app-form";
import { useAppTranslation } from "@hooks/use-app-translation";
import { Accordion } from "@ui/accordion";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@ui/dialog";

export function FolderSettingsDialog() {
  const { t } = useAppTranslation("settings.folder");
  const { isOpen, setIsOpen, options } = useFolderSettingsDialog();
  const { readOnly } = useProfile();

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="max-w-135 max-h-[90vh] overflow-y-auto">
        <DialogTitle>{t("title")}</DialogTitle>
        <DialogDescription className="sr-only">
          {t("description")}
        </DialogDescription>
        <div className="mt-4">
          {readOnly ? (
            <div className="px-4 py-2">
              <ReadOnlyAlert />
            </div>
          ) : null}
          <FormDisabledContext.Provider value={readOnly}>
            <PolicyContextProvider level="FOLDER" folderId={options?.folderId}>
              <Accordion type="multiple" className="w-full">
                <FolderGeneralSettings />
                <ScheduleSettings />
                <RetentionSettings />
                <FilesSettings />
              </Accordion>
            </PolicyContextProvider>
          </FormDisabledContext.Provider>
        </div>
      </DialogContent>
    </Dialog>
  );
}
