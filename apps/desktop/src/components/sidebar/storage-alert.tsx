import { STORAGE_USAGE_CRITICAL_THRESHOLD } from "@blinkdisk/constants/space";
import { useAppTranslation } from "@blinkdisk/hooks/use-app-translation";
import { Alert, AlertDescription, AlertTitle } from "@blinkdisk/ui/alert";
import { Button } from "@blinkdisk/ui/button";
import { SidebarMenuItem } from "@blinkdisk/ui/sidebar";
import { useSpace } from "@desktop/hooks/queries/use-space";
import { useUpgradeDialog } from "@desktop/hooks/state/use-upgrade-dialog";
import { CircleFadingArrowUpIcon } from "lucide-react";

export function SidebarStorageAlert() {
  const { t } = useAppTranslation("sidebar.storageAlert");

  const { openUpgradeDialog } = useUpgradeDialog();
  const { data: space } = useSpace();

  const percentage = (() => {
    if (!space) return 0;
    if (space.capacity === 0) return 1;
    return Math.min(space.used / space.capacity, 1);
  })();

  const full = percentage >= STORAGE_USAGE_CRITICAL_THRESHOLD;

  return (
    <SidebarMenuItem>
      <Alert variant={full ? "destructive" : "warn"} className="rounded-xl p-4">
        <AlertTitle className="text-lg font-semibold">
          {full ? t("full.title") : t("high.title")}
        </AlertTitle>
        <AlertDescription className="mt-0.5 text-sm">
          {full ? t("full.description") : t("high.description")}
          <Button
            className="mt-2.5 w-full"
            size="sm"
            variant={full ? "destructive" : "warn"}
            onClick={openUpgradeDialog}
          >
            <CircleFadingArrowUpIcon />
            {t("button")}
          </Button>
        </AlertDescription>
      </Alert>
    </SidebarMenuItem>
  );
}
