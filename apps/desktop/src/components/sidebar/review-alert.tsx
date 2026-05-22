import { useAppTranslation } from "@blinkdisk/hooks/use-app-translation";
import { Alert, AlertDescription, AlertTitle } from "@blinkdisk/ui/alert";
import { Button } from "@blinkdisk/ui/button";
import { SidebarMenuItem } from "@blinkdisk/ui/sidebar";
import { useAppStorage } from "@desktop/hooks/use-app-storage";
import { HeartIcon, XIcon } from "lucide-react";

export function SidebarReviewAlert() {
  const { t } = useAppTranslation("sidebar.reviewAlert");
  const [, setReviewDismissedAt] = useAppStorage("reviewDismissedAt");

  return (
    <SidebarMenuItem>
      <Alert variant="default" className="relative rounded-xl p-4">
        <Button
          variant="ghost"
          size="icon-xs"
          aria-label={t("dismiss")}
          className="text-muted-foreground absolute right-2 top-2"
          onClick={() => setReviewDismissedAt(new Date().toISOString())}
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
            render={
              <a
                href="https://alternativeto.net/software/blinkdisk/about/"
                target="_blank"
                rel="noreferrer"
              />
            }
          >
            <HeartIcon />
            {t("button")}
          </Button>
        </AlertDescription>
      </Alert>
    </SidebarMenuItem>
  );
}
