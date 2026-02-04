import type { UpdateStatus } from "@electron/updater";
import { useAppTranslation } from "@hooks/use-app-translation";
import { Alert, AlertDescription, AlertTitle } from "@ui/alert";
import { Button } from "@ui/button";
import { Progress } from "@ui/progress";
import { CircleAlertIcon, DownloadIcon, ExternalLinkIcon } from "lucide-react";
import { ReactNode, useEffect, useState } from "react";

export function Update({ children }: { children: ReactNode }) {
  const { t } = useAppTranslation("update");

  const [status, setStatus] = useState<UpdateStatus | null>(null);

  useEffect(() => {
    window.electron.update.status().then(setStatus);

    return window.electron.update.change((payload) => {
      setStatus(payload);
    });
  }, [setStatus]);

  if (status?.available) {
    return (
      <div className="flex min-h-screen w-screen flex-col items-center py-12">
        <div className="mt-auto"></div>
        <h1 className="text-center text-4xl font-bold">{t("title")}</h1>
        <p className="text-muted-foreground mt-4 max-w-sm text-center">
          {t("description")}
        </p>
        {status.errored ? (
          <Alert variant="warn" className="mt-12 max-w-sm">
            <CircleAlertIcon />
            <AlertTitle>{t("error.title")}</AlertTitle>
            <AlertDescription className="text-xs">
              {t("error.description")}
            </AlertDescription>
          </Alert>
        ) : !status.downloaded ? (
          <div className="w-xs mt-12 flex flex-col gap-4">
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
        <div className="mt-12 flex flex-col gap-4">
          {!status?.errored && status.downloaded ? (
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
        </div>
        <div className="mb-auto"></div>
      </div>
    );
  }

  return children;
}
