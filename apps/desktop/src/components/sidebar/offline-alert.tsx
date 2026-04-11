import { useAppTranslation } from "@blinkdisk/hooks/use-app-translation";
import { Alert, AlertDescription, AlertTitle } from "@blinkdisk/ui/alert";
import { SidebarMenuItem } from "@blinkdisk/ui/sidebar";

export function SidebarOfflineAlert() {
  const { t } = useAppTranslation("sidebar.offlineAlert");

  return (
    <SidebarMenuItem>
      <Alert variant="warn" className="rounded-xl p-4">
        <AlertTitle className="text-lg font-semibold">{t("title")}</AlertTitle>
        <AlertDescription className="mt-0.5 text-sm">
          {t("description")}
        </AlertDescription>
      </Alert>
    </SidebarMenuItem>
  );
}
