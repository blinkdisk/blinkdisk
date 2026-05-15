import type { UpdateStatus } from "@blinkdisk/electron/updater";
import { useAppTranslation } from "@blinkdisk/hooks/use-app-translation";
import { Alert, AlertDescription, AlertTitle } from "@blinkdisk/ui/alert";
import { Button } from "@blinkdisk/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@blinkdisk/ui/dialog";
import { Progress } from "@blinkdisk/ui/progress";
import { CircleAlertIcon, DownloadIcon, ExternalLinkIcon } from "lucide-react";
import { useEffect, useState } from "react";

export function UpdateDialog() {
  const { t } = useAppTranslation("update");

  const [status, setStatus] = useState<UpdateStatus | null>({
    available: true,
    downloaded: true,
    progress: null,
    errored: true,
    details: {
      files: [],
      version: "v1.0.0",
      path: "",
      sha512: "",
      releaseDate: "",
    },
  });

  useEffect(() => {
    window.electron.update.status().then(setStatus);

    return window.electron.update.change((payload) => {
      setStatus(payload);
    });
  }, []);

  return (
    <Dialog open={status?.available ?? false}>
      <DialogContent className="w-120" showCloseButton={false}>
        <DialogHeader>
          <DialogTitle>{t("title")}</DialogTitle>
          <DialogDescription>{t("description")}</DialogDescription>
        </DialogHeader>
        {status?.errored ? (
          <Alert variant="warn" className="mt-6">
            <CircleAlertIcon />
            <AlertTitle>{t("error.title")}</AlertTitle>
            <AlertDescription className="text-xs">
              {t("error.description")}
            </AlertDescription>
          </Alert>
        ) : status && !status.downloaded ? (
          <div className="mt-6 flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <p className="text-muted-foreground">{t("downloading")}</p>
              <p className="text-muted-foreground">
                {((status.progress?.percent || 0) / 100).toLocaleString(
                  undefined,
                  {
                    style: "percent",
                  },
                )}
              </p>
            </div>
            <Progress
              value={status.progress?.percent || 0}
              className="w-full"
            />
          </div>
        ) : null}
        <DialogFooter className="mt-8">
          <Button
            onClick={async () => {
              await window.electron.shell.open.browser(
                `${process.env.MARKETING_URL}/download`,
              );
            }}
            size="lg"
            variant={status?.errored ? "default" : "outline"}
          >
            <ExternalLinkIcon />
            {t("manual")}
          </Button>
          {!status?.errored && status?.downloaded ? (
            <Button
              onClick={() => {
                window.electron.update.install();
              }}
              size="lg"
              variant="default"
            >
              <DownloadIcon />
              {t("Install & Restart")}
            </Button>
          ) : null}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
