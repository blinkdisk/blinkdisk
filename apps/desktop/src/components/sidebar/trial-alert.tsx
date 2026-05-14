import { useAppTranslation } from "@blinkdisk/hooks/use-app-translation";
import { Alert, AlertDescription, AlertTitle } from "@blinkdisk/ui/alert";
import { Button } from "@blinkdisk/ui/button";
import { SidebarMenuItem } from "@blinkdisk/ui/sidebar";
import { useUpgradeDialog } from "@desktop/hooks/state/use-upgrade-dialog";
import { useRelativeTime } from "@desktop/hooks/use-relative-time";
import { formatSize } from "@desktop/lib/number";

type SidebarTrialAlertProps = {
  capacity: number;
  trialEndsAt: Date | string;
};

export function SidebarTrialAlert({
  capacity,
  trialEndsAt,
}: SidebarTrialAlertProps) {
  const { t } = useAppTranslation("sidebar.trialAlert");
  const { openUpgradeDialog } = useUpgradeDialog();
  const trialEndsIn = useRelativeTime(trialEndsAt);

  return (
    <SidebarMenuItem>
      <Alert variant="info" className="rounded-xl p-4">
        <AlertTitle className="text-lg font-semibold">{t("title")}</AlertTitle>
        <AlertDescription className="mt-0.5 text-sm">
          {t("description", {
            capacity: formatSize(capacity),
            trialEndsIn,
          })}
          <Button
            className="mt-2.5 w-full"
            size="sm"
            onClick={openUpgradeDialog}
          >
            {t("button")}
          </Button>
        </AlertDescription>
      </Alert>
    </SidebarMenuItem>
  );
}
