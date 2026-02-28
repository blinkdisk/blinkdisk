import { useRenameBackupForm } from "@desktop/hooks/forms/use-rename-backup-form";
import { useRenameBackupDialog } from "@desktop/hooks/state/use-rename-backup-dialog";
import { useAppTranslation } from "@hooks/use-app-translation";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@ui/dialog";
import { useEffect } from "react";

export function RenameBackupDialog() {
  const { t } = useAppTranslation("backup.renameDialog");

  const { isOpen, setIsOpen, options } = useRenameBackupDialog();

  const form = useRenameBackupForm({
    backupId: options?.backupId,
    currentName: options?.currentName ?? "",
    onSuccess: () => setIsOpen(false),
  });

  useEffect(() => {
    if (isOpen && options) {
      form.reset({ name: options.currentName ?? "" });
    }
  }, [isOpen, options]);

  return (
    <Dialog
      open={isOpen}
      onOpenChange={setIsOpen}
      onClosed={() => form.reset()}
    >
      <DialogContent className="w-90">
        <DialogHeader>
          <DialogTitle>{t("title")}</DialogTitle>
          <DialogDescription className="sr-only">
            {t("description")}
          </DialogDescription>
        </DialogHeader>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            form.handleSubmit(e);
          }}
          className="mt-4 flex w-full flex-col gap-4"
        >
          <form.AppField name="name">
            {(field) => (
              <field.Text
                label={{ title: t("label") }}
                placeholder={t("placeholder")}
              />
            )}
          </form.AppField>
          <DialogFooter>
            <form.AppForm>
              <form.Submit>{t("continue")}</form.Submit>
            </form.AppForm>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
