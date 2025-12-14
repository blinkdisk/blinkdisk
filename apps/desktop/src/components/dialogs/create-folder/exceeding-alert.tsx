import { useUpgradeDialog } from "@desktop/hooks/state/use-upgrade-dialog";
import { useAppTranslation } from "@hooks/use-app-translation";
import { Button } from "@ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@ui/dialog";
import { CircleFadingArrowUpIcon, PlusIcon } from "lucide-react";

type ExceedingAlertProps = {
  open: boolean;
  setOpen: (open: boolean) => void;
  submit: () => void;
  loading: boolean;
};

export function ExceedingAlert({
  open,
  setOpen,
  submit,
  loading,
}: ExceedingAlertProps) {
  const { t } = useAppTranslation("folder.createDialog.exceedingAlert");

  const { openUpgradeDialog } = useUpgradeDialog();

  return (
    <Dialog open={open} onOpenChange={() => setOpen(false)}>
      <DialogContent className="w-110">
        <DialogHeader>
          <DialogTitle className="text-xl">{t("title")}</DialogTitle>
          <DialogDescription>{t("description")}</DialogDescription>
        </DialogHeader>
        <DialogFooter className="mt-6">
          <Button
            onClick={() => submit()}
            variant="outline"
            className="w-1/2"
            loading={loading}
          >
            <PlusIcon className="mr-2" />
            {t("continue")}
          </Button>
          <Button
            onClick={() => {
              setOpen(false);
              openUpgradeDialog();
            }}
            className="w-1/2"
          >
            <CircleFadingArrowUpIcon className="mr-2" />
            {t("upgrade")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
