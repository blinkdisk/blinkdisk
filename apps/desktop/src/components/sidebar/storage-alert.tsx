import { useSpace } from "@desktop/hooks/queries/use-space";
import { useUpgradeDialog } from "@desktop/hooks/state/use-upgrade-dialog";
import { useAppTranslation } from "@hooks/use-app-translation";
import { Alert, AlertDescription, AlertTitle } from "@ui/alert";
import { Button } from "@ui/button";
import { SidebarMenuItem } from "@ui/sidebar";
import { useMemo } from "react";

export function SidebarStorageAlert() {
  const { t } = useAppTranslation("sidebar.storageAlert");

  const { openUpgradeDialog } = useUpgradeDialog();
  const { data: space } = useSpace();

  const percentage = useMemo(() => {
    if (!space) return 0;
    return Math.min(space.used / space.capacity, 1);
  }, [space]);

  const full = useMemo(() => {
    return percentage >= 0.98;
  }, [percentage]);

  if (percentage < 0.8) return null;
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
            variant={full ? "destructive" : "default"}
            onClick={openUpgradeDialog}
          >
            {t("button")}
          </Button>
        </AlertDescription>
      </Alert>
    </SidebarMenuItem>
  );
}
