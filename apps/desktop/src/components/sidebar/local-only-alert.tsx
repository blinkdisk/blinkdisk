import { useAppTranslation } from "@blinkdisk/hooks/use-app-translation";
import { Alert, AlertDescription, AlertTitle } from "@blinkdisk/ui/alert";
import { Button } from "@blinkdisk/ui/button";
import { SidebarMenuItem } from "@blinkdisk/ui/sidebar";
import { useCreateVaultDialog } from "@desktop/hooks/state/use-create-vault-dialog";
import { useAppStorage } from "@desktop/hooks/use-app-storage";
import { PlusIcon, XIcon } from "lucide-react";

export function SidebarLocalOnlyAlert() {
  const { t } = useAppTranslation("sidebar.localOnlyAlert");
  const { openCreateVault } = useCreateVaultDialog();
  const [, setCloudBackupDismissedAt] = useAppStorage(
    "sidebarAlerts.dismissed.cloudBackup",
  );

  return (
    <SidebarMenuItem>
      <Alert variant="warn" className="relative rounded-xl p-4">
        <Button
          variant="ghost"
          size="icon-xs"
          aria-label={t("dismiss")}
          className="absolute right-2 top-2 text-amber-600/70 hover:bg-amber-500/10 hover:text-amber-600 dark:text-amber-500/70 dark:hover:text-amber-500"
          onClick={() => setCloudBackupDismissedAt(new Date().toISOString())}
        >
          <XIcon />
        </Button>
        <AlertTitle className="pr-8 text-lg font-semibold">
          {t("title")}
        </AlertTitle>
        <AlertDescription className="mt-0.5 text-sm">
          {t("description")}
          <Button
            className="mt-2.5 w-full"
            size="sm"
            variant="warn"
            onClick={() =>
              openCreateVault({
                step: "DETAILS",
                provider: "CLOUDBLINK",
                autoSelectedProvider: true,
              })
            }
          >
            <PlusIcon />
            {t("button")}
          </Button>
        </AlertDescription>
      </Alert>
    </SidebarMenuItem>
  );
}
