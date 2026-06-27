import { useAppTranslation } from "@blinkdisk/hooks/use-app-translation";
import { Button } from "@blinkdisk/ui/button";
import { CircularProgress } from "@blinkdisk/ui/circular-progress";
import { cn } from "@blinkdisk/utils/class";
import { useRestoreList } from "@desktop/hooks/queries/use-restore-list";
import { CheckIcon } from "lucide-react";

export function VaultRestores() {
  const { data: restores } = useRestoreList();
  const { t } = useAppTranslation("directory.restore");

  if (!restores?.length) return null;
  return (
    <div className="mb-8 flex flex-col gap-4">
      {restores.map((restore) => (
        <div
          key={restore.id}
          className="bg-card relative flex items-center justify-between overflow-hidden rounded-xl border p-3"
        >
          <div
            style={{
              width: `${(restore.progress * 100).toFixed(0)}%`,
            }}
            className="bg-foreground/5 dark:bg-foreground/10 absolute bottom-0 left-0 top-0 transition-all"
          ></div>
          <div className="flex items-center gap-4 pl-1">
            <div className="relative flex size-6 items-center justify-center">
              <div
                className={cn(
                  "absolute inset-0 flex items-center justify-center transition-all duration-500",
                  restore.status === "RUNNING"
                    ? "scale-100 opacity-100"
                    : "scale-50 opacity-0",
                )}
              >
                <CircularProgress
                  value={restore.progress * 100}
                  size={30}
                  strokeWidth={4}
                  progressClassName="opacity-60 dark:opacity-70"
                />
              </div>
              <CheckIcon
                className={cn(
                  "absolute left-1/2 top-1/2 size-5 -translate-x-1/2 -translate-y-1/2 text-lime-500 transition-all duration-200",
                  restore.status === "RUNNING"
                    ? "scale-50 opacity-0"
                    : "scale-100 opacity-100 delay-200",
                )}
              />
            </div>
            <div className="flex flex-col">
              <p className="font-medium">{t("title")}</p>
              <p className="text-muted-foreground text-xs">
                {t(
                  restore.files && restore.directories
                    ? "description.both"
                    : restore.files
                      ? "description.files"
                      : "description.directories",
                  {
                    count:
                      (restore.files ? restore.files : restore.directories) ||
                      0,
                    files: (restore.files || 0).toLocaleString(),
                    directories: (restore.directories || 0).toLocaleString(),
                  },
                )}
              </p>
            </div>
          </div>
          <Button
            onClick={() =>
              window.electron.shell.open.folder(restore.destination)
            }
            size="sm"
            variant="secondary"
          >
            {t("openFolder")}
          </Button>
        </div>
      ))}
    </div>
  );
}
