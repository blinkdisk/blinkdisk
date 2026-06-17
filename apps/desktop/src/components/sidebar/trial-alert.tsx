import {
  TRIAL_ELAPSED_CRITICAL_THRESHOLD,
  TRIAL_ELAPSED_WARNING_THRESHOLD,
} from "@blinkdisk/constants/trial";
import { useAppTranslation } from "@blinkdisk/hooks/use-app-translation";
import { Alert, AlertDescription, AlertTitle } from "@blinkdisk/ui/alert";
import { Button } from "@blinkdisk/ui/button";
import { SidebarMenuItem } from "@blinkdisk/ui/sidebar";
import { useUpgradeDialog } from "@desktop/hooks/state/use-upgrade-dialog";
import { useRelativeTime } from "@desktop/hooks/use-relative-time";
import { formatSize } from "@desktop/lib/number";
import { CircleFadingArrowUpIcon } from "lucide-react";

type SidebarTrialAlertProps = {
  capacity: number;
  trialStartedAt: Date | string;
  trialEndsAt: Date | string;
};

export function SidebarTrialAlert({
  capacity,
  trialStartedAt,
  trialEndsAt,
}: SidebarTrialAlertProps) {
  const { t } = useAppTranslation("sidebar.trialAlert");
  const { openUpgradeDialog } = useUpgradeDialog();

  const trialEndsIn = useRelativeTime(trialEndsAt);

  const trialStartedAtMs = new Date(trialStartedAt).getTime();
  const trialEndsAtMs = new Date(trialEndsAt).getTime();
  const trialDurationMs = trialEndsAtMs - trialStartedAtMs;
  const trialElapsed = Math.min(
    Math.max(
      trialDurationMs <= 0
        ? 1
        : (Date.now() - trialStartedAtMs) / trialDurationMs,
      0,
    ),
    1,
  );

  const threshold =
    trialElapsed >= TRIAL_ELAPSED_CRITICAL_THRESHOLD
      ? "critical"
      : trialElapsed >= TRIAL_ELAPSED_WARNING_THRESHOLD
        ? "warning"
        : "active";
  const variant =
    threshold === "critical"
      ? "destructive"
      : threshold === "warning"
        ? "warn"
        : "info";
  const copyThreshold = threshold === "critical" ? "warning" : threshold;

  const buttonVariant =
    variant === "destructive"
      ? "destructive"
      : variant === "warn"
        ? "warn"
        : "default";

  return (
    <SidebarMenuItem>
      <Alert variant={variant} className="rounded-xl p-4">
        <AlertTitle className="text-lg font-semibold">
          {t(`${copyThreshold}.title`)}
        </AlertTitle>
        <AlertDescription className="mt-0.5 text-sm">
          {t(`${copyThreshold}.description`, {
            capacity: formatSize(capacity),
            trialEndsIn,
          })}
          <Button
            className="mt-2.5 w-full"
            size="sm"
            variant={buttonVariant}
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
