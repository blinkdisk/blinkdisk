import { useDeleteFolder } from "@desktop/hooks/mutations/core/use-delete-folder";
import { useDeleteFolderDialog } from "@desktop/hooks/state/use-delete-folder-dialog";
import { useFolder } from "@desktop/hooks/use-folder";
import { useAppTranslation } from "@hooks/use-app-translation";
import { Alert, AlertDescription, AlertTitle } from "@ui/alert";
import { Button } from "@ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@ui/dialog";
import { InfoIcon } from "lucide-react";

export function DeleteFolderDialog() {
  const { t } = useAppTranslation("folder.deleteDialog");

  const { isOpen, setIsOpen, options } = useDeleteFolderDialog();
  const { data: folder } = useFolder(options?.folderId);

  const { mutateAsync, isPending } = useDeleteFolder({
    onSuccess: () => {
      setIsOpen(false);
    },
  });

  return (
    <>
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="w-105">
          <DialogHeader>
            <DialogTitle>{t("title")}</DialogTitle>
            <DialogDescription>{t("description")}</DialogDescription>
          </DialogHeader>
          <Alert className="mb-6 mt-4 w-full">
            <InfoIcon />
            <AlertTitle>{t("alert.title")}</AlertTitle>
            <AlertDescription className="text-xs">
              {t("alert.description")}
            </AlertDescription>
          </Alert>
          <DialogFooter>
            <Button onClick={() => setIsOpen(false)} variant="outline">
              {t("cancel")}
            </Button>
            <Button
              loading={isPending}
              onClick={() =>
                folder &&
                mutateAsync({
                  path: folder.source.path,
                })
              }
              variant="destructive"
            >
              {t("continue")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
