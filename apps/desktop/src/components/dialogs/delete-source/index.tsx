import { useAppTranslation } from "@blinkdisk/hooks/use-app-translation";
import { isFileLikeSource } from "@blinkdisk/schemas/source";
import { Alert, AlertDescription, AlertTitle } from "@blinkdisk/ui/alert";
import { Button } from "@blinkdisk/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@blinkdisk/ui/dialog";
import { useDeleteSource } from "@desktop/hooks/mutations/core/use-delete-source";
import { useDeleteSourceDialog } from "@desktop/hooks/state/use-delete-source-dialog";
import { useSource } from "@desktop/hooks/use-source";
import { InfoIcon } from "lucide-react";

export function DeleteSourceDialog() {
  const { t } = useAppTranslation("folder.deleteDialog");

  const { isOpen, setIsOpen, options } = useDeleteSourceDialog();
  const { data: source } = useSource(options?.sourceId, {
    profile: options?.profile,
  });
  const typeKey = isFileLikeSource(source?.type) ? "file" : "folder";

  const { mutateAsync, isPending } = useDeleteSource({
    onSuccess: () => {
      setIsOpen(false);
    },
    profile: options?.profile,
  });

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="w-105">
        <DialogHeader>
          <DialogTitle>{t(`title.${typeKey}`)}</DialogTitle>
          <DialogDescription>{t(`description.${typeKey}`)}</DialogDescription>
        </DialogHeader>
        <Alert className="mb-6 mt-4 w-full">
          <InfoIcon />
          <AlertTitle>{t("alert.title")}</AlertTitle>
          <AlertDescription className="text-xs">
            {t("alert.description")}
          </AlertDescription>
        </Alert>
        <DialogFooter>
          <Button onClick={() => setIsOpen(false)} variant="secondary">
            {t("cancel")}
          </Button>
          <Button
            loading={isPending}
            onClick={() =>
              source &&
              mutateAsync({
                path: source.source.path,
              })
            }
            variant="destructive"
          >
            {t(`continue.${typeKey}`)}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
