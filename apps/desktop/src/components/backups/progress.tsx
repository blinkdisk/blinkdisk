import { CoreFolderItem } from "@desktop/hooks/queries/core/use-folder-list";
import { formatSize } from "@desktop/lib/number";
import { useAppTranslation } from "@hooks/use-app-translation";
import { CircularProgress } from "@ui/circular-progress";
import { useMemo } from "react";

interface BackupProgressProps {
  upload: Required<CoreFolderItem["upload"]>;
  variant?: "big" | "default";
}

export function BackupProgress({
  upload,
  variant = "default",
}: BackupProgressProps) {
  const { t } = useAppTranslation("backup.progress");

  const numbers = useMemo(() => {
    return {
      completed: formatSize(
        (upload?.cachedBytes || 0) + (upload?.hashedBytes || 0),
        { round: 1 },
      ),
      total: formatSize(upload?.estimatedBytes || 0, { round: 1 }),
      percentage: (upload?.progress || 0).toLocaleString(undefined, {
        style: "percent",
      }),
    };
  }, [upload]);

  return (
    <div className="flex items-center gap-3">
      <CircularProgress
        value={100 * (upload?.progress || 0)}
        size={30}
        strokeWidth={4}
        progressClassName="opacity-60 dark:opacity-70"
      />
      <div className="flex flex-col gap-0.5">
        <p className="font-medium">{t(`${variant}.title`, numbers)}</p>
        <p className="text-muted-foreground text-xs">
          {t(`${variant}.description`, numbers)}
        </p>
      </div>
    </div>
  );
}
