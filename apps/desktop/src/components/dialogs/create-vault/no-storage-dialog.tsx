import { useAppTranslation } from "@blinkdisk/hooks/use-app-translation";
import { Button } from "@blinkdisk/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@blinkdisk/ui/dialog";
import { useNoStorageDialog } from "@desktop/hooks/state/use-no-storage-dialog";
import { useUpgradeDialog } from "@desktop/hooks/state/use-upgrade-dialog";
import { CircleFadingArrowUpIcon } from "lucide-react";

export function NoStorageDialog() {
  const { t } = useAppTranslation("vault.createDialog.noStorageDialog");
  const { isOpen, setIsOpen } = useNoStorageDialog();
  const { openUpgradeDialog } = useUpgradeDialog();

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="w-110">
        <DialogHeader>
          <DialogTitle className="text-xl">{t("title")}</DialogTitle>
          <DialogDescription>{t("description")}</DialogDescription>
        </DialogHeader>
        <DialogFooter className="mt-6">
          <Button
            className="w-full"
            onClick={() => {
              setIsOpen(false);
              openUpgradeDialog();
            }}
          >
            <CircleFadingArrowUpIcon />
            {t("upgrade")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
