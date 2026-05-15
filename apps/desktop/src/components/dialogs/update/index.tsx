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
import { useCallback, useEffect, useState } from "react";

type UpdateDialogTestState = "hidden" | "downloading" | "downloaded" | "error";

declare global {
  interface Window {
    testUpdateDialog?: (state?: UpdateDialogTestState) => void;
  }
}

function getTestUpdateStatus(state: UpdateDialogTestState): UpdateStatus {
  return {
    available: state !== "hidden",
    details:
      state === "hidden"
        ? null
        : {
            files: [],
            path: "",
            releaseDate: new Date().toISOString(),
            sha512: "",
            version: "v1.0.0",
          },
    downloaded: state === "downloaded",
    progress:
      state === "downloading"
        ? {
            bytesPerSecond: 1_200_000,
            delta: 600_000,
            percent: 42,
            total: 100_000_000,
            transferred: 42_000_000,
          }
        : null,
    errored: state === "error",
  };
}

export function UpdateDialog() {
  const { t } = useAppTranslation("update");

  const [status, setStatus] = useState<UpdateStatus | null>(null);

  useEffect(() => {
    window.electron.update.status().then(setStatus);

    return window.electron.update.change((payload) => {
      setStatus(payload);
    });
  }, []);

  useEffect(() => {
    if (!import.meta.env.DEV) return;

    window.testUpdateDialog = (state = "downloading") => {
      setStatus(getTestUpdateStatus(state));
    };

    return () => {
      delete window.testUpdateDialog;
    };
  }, []);

  const downloadManually = useCallback(async () => {
    await window.electron.shell.open.browser(
      `${process.env.MARKETING_URL}/download`,
    );
  }, []);

  return (
    <Dialog open={status?.available ?? false}>
      <DialogContent className="w-100" showCloseButton={false}>
        <DialogHeader>
          <DialogTitle className="text-center text-2xl">
            {t("title")}
          </DialogTitle>
          <DialogDescription className="text-center mt-2">
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
              <Button onClick={downloadManually} size="icon" variant="outline">
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
  );
}
