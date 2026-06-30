import { useAppTranslation } from "@blinkdisk/hooks/use-app-translation";
import { CircularProgress } from "@blinkdisk/ui/circular-progress";
import { Loader } from "@blinkdisk/ui/loader";
import { cn } from "@blinkdisk/utils/class";
import type { CoreSourceItem } from "@desktop/hooks/queries/core/use-source-list";
import { formatInt, formatSize } from "@desktop/lib/number";

type BackupProgressProps = {
  upload: CoreSourceItem["upload"];
  size?: "sm" | "default";
};

export function BackupProgress({
  upload,
  size = "default",
}: BackupProgressProps) {
  const { t } = useAppTranslation("backup.progress");

  const fallback = !upload?.estimatedBytes;

  const numbers = {
    completed: formatSize(
      (upload?.cachedBytes || 0) + (upload?.hashedBytes || 0),
      { round: 1 },
    ),
    total: upload?.estimatedBytes
      ? formatSize(upload?.estimatedBytes || 0, { round: 1 })
      : "",
    percentage: (upload?.progress || 0).toLocaleString(undefined, {
      style: "percent",
    }),
    files: formatInt((upload?.hashedFiles || 0) + (upload?.cachedFiles || 0)),
  };

  return (
    <div className="flex items-center gap-3">
      {fallback ? (
        <Loader size={size === "sm" ? 1.5 : 1.6} />
      ) : (
        <CircularProgress
          value={100 * (upload?.progress || 0)}
          size={30}
          strokeWidth={4}
          progressClassName="opacity-60 dark:opacity-70"
        />
      )}
      <div className={cn("flex flex-col", size !== "sm" && "gap-0.5")}>
        <p
          className={cn(
            "whitespace-nowrap font-medium",
            size === "sm" && "text-sm",
          )}
        >
          {fallback ? t("title.fallback") : t("title.default", numbers)}
        </p>
        <p className="text-muted-foreground whitespace-nowrap text-xs">
          {t(`description.${fallback ? "fallback" : "total"}`, numbers)}
        </p>
      </div>
    </div>
  );
}
