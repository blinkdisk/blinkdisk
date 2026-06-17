import { useAppTranslation } from "@blinkdisk/hooks/use-app-translation";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@blinkdisk/ui/dialog";
import { SubscriptionPlans } from "@desktop/components/subscriptions/plans";
import { useUpgradeDialog } from "@desktop/hooks/state/use-upgrade-dialog";

export function UpgradeDialog() {
  const { t } = useAppTranslation("subscription.upgradeDialog");
  const { isOpen, setIsOpen } = useUpgradeDialog();

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent
        className="block max-h-[80vh] w-fit max-w-[95vw]"
        showCloseButton={false}
      >
        <SubscriptionPlans
          cardClassName="w-80"
          header={
            <div className="flex flex-col">
              <DialogTitle className="text-2xl">{t("title")}</DialogTitle>
              <DialogDescription className="text-sm">
                {t("description")}
              </DialogDescription>
            </div>
          }
        />
      </DialogContent>
    </Dialog>
  );
}
