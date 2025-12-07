import { CoreFolderItem } from "@desktop/hooks/queries/core/use-folder-list";
import { formatInt, formatSize } from "@desktop/lib/number";
import { useAppTranslation } from "@hooks/use-app-translation";
import { CircularProgress } from "@ui/circular-progress";
import { EmojiCard } from "@ui/emoji-card";
import { Loader } from "@ui/loader";
import { Skeleton } from "@ui/skeleton";
import { cn } from "@utils/class";

type FolderPreviewProps = {
  folder?: CoreFolderItem;
  size?: "sm" | "default";
};

export function FolderPreview({ folder, size }: FolderPreviewProps) {
  const { t } = useAppTranslation("folder.preview");

  return (
    <div
      className={cn(
        "flex w-full min-w-0 items-center gap-4",
        size === "sm" && "gap-3",
      )}
    >
      {folder ? (
        <EmojiCard emoji={folder.emoji} size={size === "sm" ? "sm" : "md"} />
      ) : (
        <Skeleton
          width={size === "sm" ? "2.25rem" : "2.75rem"}
          height={size === "sm" ? "2.25rem" : "2.75rem"}
          className="rounded-md"
        />
      )}
      <div className="flex w-full flex-col">
        <div className="flex items-center gap-1.5">
          <h2
            className={cn(
              "max-w-full truncate text-lg font-semibold",
              size === "sm" && "text-sm",
            )}
          >
            {folder ? (
              folder.name || folder.source.path
            ) : (
              <Skeleton width={100} />
            )}
          </h2>
          {folder && folder.status === "UPLOADING" ? (
            <CircularProgress
              value={100 * (folder?.upload?.progress || 0)}
              size={15}
              strokeWidth={3}
              containerClassName="mb-0.5"
              progressClassName="opacity-60 dark:opacity-70"
            />
          ) : folder && folder.status === "PENDING" ? (
            <Loader size={size === "sm" ? 0.8 : 1} className="mb-0.5" />
          ) : null}
        </div>
        <p
          className={cn(
            "text-muted-foreground min-w-0 max-w-full truncate text-sm font-normal",
            size === "sm" && "text-xs",
          )}
        >
          {folder ? (
            <>
              {folder.status === "PENDING"
                ? t("backupPending")
                : folder.status === "UPLOADING"
                  ? t("backupRunning")
                  : folder.lastSnapshot?.incomplete === "checkpoint"
                    ? t("backupPaused")
                    : folder.lastSnapshot &&
                        folder.lastSnapshot.incomplete !== "checkpoint"
                      ? t("stats", {
                          fileCount: formatInt(
                            (folder.lastSnapshot?.stats?.cachedFiles || 0) +
                              (folder.lastSnapshot?.stats?.nonCachedFiles || 0),
                          ),
                          size: formatSize(
                            folder.lastSnapshot?.stats?.totalSize || 0,
                          ),
                        })
                      : t("noBackups")}
            </>
          ) : (
            <Skeleton width={100} />
          )}
        </p>
      </div>
    </div>
  );
}
