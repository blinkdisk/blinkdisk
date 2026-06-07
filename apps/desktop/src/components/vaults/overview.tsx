import { useAppTranslation } from "@blinkdisk/hooks/use-app-translation";
import { Card, CardContent, CardTitle } from "@blinkdisk/ui/card";
import { Skeleton } from "@blinkdisk/ui/skeleton";
import { cn } from "@blinkdisk/utils/class";
import { Empty } from "@desktop/components/empty";
import { FolderList } from "@desktop/components/folders/list";
import { LocalButton } from "@desktop/components/vaults/local-button";
import { VaultStatSparkline } from "@desktop/components/vaults/stat-sparkline";
import { useStartBackup } from "@desktop/hooks/mutations/core/use-start-backup";
import {
  type CoreBackupItem,
  useBackupList,
} from "@desktop/hooks/queries/core/use-backup-list";
import {
  type CoreFolderItem,
  useUnfilteredFolderList,
} from "@desktop/hooks/queries/core/use-folder-list";
import type { VaultItem } from "@desktop/hooks/queries/use-vault";
import { useCreateFolderDialog } from "@desktop/hooks/state/use-create-folder-dialog";
import { formatInt, formatSize } from "@desktop/lib/number";
import {
  ArrowDownRightIcon,
  ArrowUpRightIcon,
  CloudUploadIcon,
  FolderPlusIcon,
  PlusIcon,
} from "lucide-react";
import { useMemo } from "react";

type VaultOverviewProps = {
  vault?: VaultItem;
  folders?: CoreFolderItem[];
};

export function VaultOverview({ vault, folders }: VaultOverviewProps) {
  const { t } = useAppTranslation("vault.overview");

  const { openCreateFolder } = useCreateFolderDialog();
  const { mutate: startBackup, isPending: isStartingBackup } = useStartBackup();
  const { data: allFolders } = useUnfilteredFolderList();
  const { data: backups } = useBackupList({ filters: "none" });

  const isAnyBackupRunning = useMemo(
    () =>
      folders?.some(
        (folder) =>
          folder.status === "UPLOADING" || folder.status === "PENDING",
      ),
    [folders],
  );

  const stats = useMemo(() => {
    if (!allFolders) return null;

    return {
      totalSize: allFolders.reduce(
        (sum, folder) => sum + (folder.lastSnapshot?.stats.totalSize || 0),
        0,
      ),
      fileCount: allFolders.reduce(
        (sum, folder) =>
          sum +
          (folder.lastSnapshot?.stats.nonCachedFiles || 0) +
          (folder.lastSnapshot?.stats.cachedFiles || 0),
        0,
      ),
      directoryCount: allFolders.reduce(
        (sum, folder) => sum + (folder.lastSnapshot?.stats.dirCount || 0),
        0,
      ),
    };
  }, [allFolders]);

  const statHistory = useMemo(() => {
    if (!backups) return null;

    return buildVaultStatHistory(backups);
  }, [backups]);

  return (
    <div
      className={cn(
        "flex min-h-full flex-col overflow-x-hidden p-6",
        folders !== undefined ? "overflow-y-auto" : "overflow-hidden",
      )}
    >
      <div className="grid grid-cols-3 gap-6">
        <VaultStatCard
          title={t("stats.totalSize")}
          description={t("stats.totalSizeDescription")}
          value={stats ? formatSize(stats.totalSize) : undefined}
          history={statHistory?.totalSize}
          isLoading={!vault || !stats}
        />
        <VaultStatCard
          title={t("stats.files")}
          description={t("stats.filesDescription")}
          value={stats ? formatInt(stats.fileCount) : undefined}
          history={statHistory?.fileCount}
          isLoading={!vault || !stats}
        />
        <VaultStatCard
          title={t("stats.directories")}
          description={t("stats.directoriesDescription")}
          value={stats ? formatInt(stats.directoryCount) : undefined}
          history={statHistory?.directoryCount}
          isLoading={!vault || !stats}
        />
      </div>
      <div className="mt-8 flex items-center justify-between">
        <div className="flex flex-col">
          <h2 className="text-xl font-semibold">
            {folders !== undefined ? (
              t("folders.title")
            ) : (
              <Skeleton width={80} />
            )}
          </h2>
          <p className="text-muted-foreground text-xs">
            {folders !== undefined ? (
              t("folders.count", { count: folders?.length })
            ) : (
              <Skeleton width={120} />
            )}
          </p>
        </div>
        <div className="flex items-center gap-3">
          {folders !== undefined ? (
            <>
              <LocalButton
                onClick={() => openCreateFolder()}
                variant="secondary"
              >
                <PlusIcon />
                {t("folders.addFolder")}
              </LocalButton>
              {folders.length > 0 ? (
                <LocalButton
                  onClick={() => startBackup({})}
                  loading={isStartingBackup || isAnyBackupRunning}
                >
                  <CloudUploadIcon />
                  {t("folders.backupAll")}
                </LocalButton>
              ) : null}
            </>
          ) : (
            <>
              <Skeleton width="8rem" height="2.75rem" />
              <Skeleton width="9rem" height="2.75rem" />
            </>
          )}
        </div>
      </div>
      {folders !== null && folders !== undefined && !folders.length ? (
        <Empty
          icon={<FolderPlusIcon />}
          title={t("folders.empty.title")}
          description={t("folders.empty.description")}
        >
          <LocalButton onClick={() => openCreateFolder()} size="lg">
            <PlusIcon />
            {t("folders.addFolder")}
          </LocalButton>
        </Empty>
      ) : (
        <FolderList folders={folders} />
      )}
    </div>
  );
}

type VaultStatCardProps = {
  title: string;
  description: string;
  value?: string;
  history?: number[];
  isLoading: boolean;
};

function VaultStatCard({
  title,
  value,
  history,
  isLoading,
}: VaultStatCardProps) {
  const trend = getHistoryTrend(history);
  const TrendIcon =
    trend.direction === "down" ? ArrowDownRightIcon : ArrowUpRightIcon;

  return (
    <Card className="overflow-hidden py-0">
      <CardContent className="p-5">
        <div className="flex items-start justify-between gap-4">
          <CardTitle className="text-muted-foreground min-w-0 text-sm font-medium">
            {!isLoading ? title : <Skeleton width={90} />}
          </CardTitle>
          {!isLoading ? (
            <div className="text-foreground flex shrink-0 items-center gap-1 text-xs font-semibold">
              <TrendIcon className="size-4" />
              {formatTrendPercent(trend.percent)}
            </div>
          ) : null}
        </div>
        <div className="mt-5 flex items-end justify-between gap-4">
          <p className="shrink-0 whitespace-nowrap text-4xl font-semibold tracking-normal">
            {!isLoading ? value : <Skeleton width={120} />}
          </p>
          {!isLoading ? (
            <VaultStatSparkline
              className="text-foreground pointer-events-none h-10 min-w-0 max-w-48 flex-1"
              values={history ?? []}
            />
          ) : null}
        </div>
      </CardContent>
    </Card>
  );
}

function getHistoryTrend(history?: number[]) {
  const first = history?.find((value) => value > 0) ?? history?.[0] ?? 0;
  const last = history?.[history.length - 1] ?? 0;
  const percent =
    first === 0 ? (last > 0 ? 100 : 0) : ((last - first) / first) * 100;

  return {
    direction: percent < 0 ? "down" : "up",
    percent: Math.abs(percent),
  };
}

function formatTrendPercent(percent: number) {
  return `${percent.toLocaleString(undefined, {
    maximumFractionDigits: 1,
    minimumFractionDigits: 1,
  })}%`;
}

function buildVaultStatHistory(backups: CoreBackupItem[]) {
  const days = Array.from({ length: 30 }, (_, index) => {
    const date = new Date();
    date.setHours(0, 0, 0, 0);
    date.setDate(date.getDate() - (29 - index));
    return date;
  });
  const sortedBackups = [...backups]
    .filter((backup) => backup.incomplete === undefined)
    .sort(
      (a, b) =>
        new Date(a.startTime).getTime() - new Date(b.startTime).getTime(),
    );
  const latestByRoot = new Map<string, CoreBackupItem>();
  let backupIndex = 0;

  return days.reduce(
    (history, day) => {
      const nextDay = new Date(day);
      nextDay.setDate(day.getDate() + 1);

      while (backupIndex < sortedBackups.length) {
        const backup = sortedBackups[backupIndex];
        if (!backup || new Date(backup.startTime) >= nextDay) break;

        latestByRoot.set(backup.rootID, backup);
        backupIndex += 1;
      }

      const totals = Array.from(latestByRoot.values()).reduce(
        (sum, backup) => ({
          totalSize: sum.totalSize + backup.summary.size,
          fileCount: sum.fileCount + backup.summary.files,
          directoryCount: sum.directoryCount + backup.summary.dirs,
        }),
        { totalSize: 0, fileCount: 0, directoryCount: 0 },
      );

      history.totalSize.push(totals.totalSize);
      history.fileCount.push(totals.fileCount);
      history.directoryCount.push(totals.directoryCount);

      return history;
    },
    {
      totalSize: [] as number[],
      fileCount: [] as number[],
      directoryCount: [] as number[],
    },
  );
}
