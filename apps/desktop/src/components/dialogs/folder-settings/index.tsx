import { FolderGeneralSettings } from "#components/folders/general-settings";
import { CompressionSettings } from "#components/policy/compression";
import { PolicyContextProvider } from "#components/policy/context";
import { FilesSettings } from "#components/policy/files";
import { RetentionSettings } from "#components/policy/retention";
import { ScheduleSettings } from "#components/policy/schedule";
import { useFolderSettingsDialog } from "#hooks/state/use-folder-settings-dialog";
import { useAppTranslation } from "@blinkdisk/hooks/use-app-translation";
import { Accordion } from "@blinkdisk/ui/accordion";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@blinkdisk/ui/dialog";
import { useState } from "react";

export function FolderSettingsDialog() {
  const { t } = useAppTranslation("settings.folder");
  const { isOpen, setIsOpen, options } = useFolderSettingsDialog();

  const [open, setOpen] = useState<string[]>([]);

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="max-w-135 max-h-[90vh] overflow-y-auto">
        <DialogTitle>{t("title")}</DialogTitle>
        <DialogDescription className="sr-only">
          {t("description")}
        </DialogDescription>
        <div className="mt-4">
          <PolicyContextProvider level="FOLDER" folderId={options?.folderId}>
            {({ loading }) => (
              <Accordion
                className="w-full"
                value={loading ? [] : open}
                onValueChange={setOpen}
                multiple
              >
                <FolderGeneralSettings />
                <ScheduleSettings />
                <RetentionSettings />
                <FilesSettings />
                <CompressionSettings />
              </Accordion>
            )}
          </PolicyContextProvider>
        </div>
      </DialogContent>
    </Dialog>
  );
}
