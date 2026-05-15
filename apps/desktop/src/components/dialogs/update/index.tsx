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
import { useUpdate } from "@desktop/hooks/use-update";
import { CircleAlertIcon, DownloadIcon, ExternalLinkIcon } from "lucide-react";
import { useCallback, useState } from "react";

export function UpdateDialog() {
  const { t } = useAppTranslation("update");
  const { status } = useUpdate();
  const [dismissed, setDismissed] = useState(false);
  const [confirmDismissOpen, setConfirmDismissOpen] = useState(false);

  const downloadManually = useCallback(async () => {
    await window.electron.shell.open.browser(
      `${process.env.MARKETING_URL}/download`,
    );
  }, []);

  const dismiss = useCallback(() => {
    setDismissed(true);
    setConfirmDismissOpen(false);
  }, []);

  return (
    <>
      <Dialog
        open={(status?.available ?? false) && !dismissed}
        onOpenChange={(open) => {
          if (!open) setConfirmDismissOpen(true);
        }}
      >
        <DialogContent className="w-100">
          <DialogHeader>
            <DialogTitle className="text-2xl">{t("title")}</DialogTitle>
            <DialogDescription className="mt-2">
              {t("description")}
            </DialogDescription>
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
            {status?.errored ? (
              <Button onClick={downloadManually} className="grow">
                <ExternalLinkIcon />
                {t("manual")}
              </Button>
            ) : !status?.downloaded ? (
              <Button
                onClick={downloadManually}
                variant="outline"
                className="grow"
              >
                <ExternalLinkIcon />
                {t("manual")}
              </Button>
            ) : (
              <>
                <Button
                  onClick={downloadManually}
                  size="icon"
                  variant="outline"
                >
                  <ExternalLinkIcon />
                </Button>
                <Button
                  onClick={() => {
                    window.electron.update.install();
                  }}
                  variant="default"
                  className="grow"
                >
                  <DownloadIcon />
                  {t("install")}
                </Button>
              </>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
      <Dialog open={confirmDismissOpen} onOpenChange={setConfirmDismissOpen}>
        <DialogContent className="w-100">
          <DialogHeader>
            <DialogTitle>{t("dismiss.title")}</DialogTitle>
            <DialogDescription className="sr-only">
              {t("dismiss.warning.description")}
            </DialogDescription>
          </DialogHeader>
          <Alert variant="warn" className="mt-6">
            <CircleAlertIcon />
            <AlertTitle>{t("dismiss.warning.title")}</AlertTitle>
            <AlertDescription>
              {t("dismiss.warning.description")}
            </AlertDescription>
          </Alert>
          <DialogFooter className="mt-6">
            <Button
              variant="outline"
              onClick={() => {
                setConfirmDismissOpen(false);
              }}
            >
              {t("dismiss.cancel")}
            </Button>
            <Button variant="warn" onClick={dismiss}>
              {t("dismiss.confirm")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
