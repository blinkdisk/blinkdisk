import { useAppTranslation } from "@blinkdisk/hooks/use-app-translation";
import { Alert, AlertDescription, AlertTitle } from "@blinkdisk/ui/alert";
import { Button } from "@blinkdisk/ui/button";
import { SidebarMenuItem } from "@blinkdisk/ui/sidebar";
import { useUpdateDialog } from "@desktop/hooks/state/use-update-dialog";
import { DownloadIcon } from "lucide-react";

export function SidebarUpdateAlert() {
  const { t } = useAppTranslation("sidebar.updateAlert");
  const { setIsOpen } = useUpdateDialog();

  return (
    <SidebarMenuItem>
      <Alert variant="info" className="rounded-xl p-4">
        <AlertTitle className="text-lg font-semibold">{t("title")}</AlertTitle>
        <AlertDescription className="mt-0.5 text-sm">
          {t("description")}
          <Button
            className="mt-2.5 w-full"
            size="sm"
            onClick={() => {
              setIsOpen(true);
            }}
          >
            <DownloadIcon />
            {t("button")}
          </Button>
        </AlertDescription>
      </Alert>
    </SidebarMenuItem>
  );
}
