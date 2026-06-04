import { useAppTranslation } from "@blinkdisk/hooks/use-app-translation";
import { Card, CardContent, CardTitle } from "@blinkdisk/ui/card";
import { Skeleton } from "@blinkdisk/ui/skeleton";
import { cn } from "@blinkdisk/utils/class";
import { Empty } from "@desktop/components/empty";
import { FolderList } from "@desktop/components/folders/list";
import { LocalButton } from "@desktop/components/vaults/local-button";
import { useStartBackup } from "@desktop/hooks/mutations/core/use-start-backup";
import {
  type CoreFolderItem,
  useUnfilteredFolderList,
} from "@desktop/hooks/queries/core/use-folder-list";
import type { VaultItem } from "@desktop/hooks/queries/use-vault";
import { useCreateFolderDialog } from "@desktop/hooks/state/use-create-folder-dialog";
import { formatInt, formatSize } from "@desktop/lib/number";
import {
  CloudUploadIcon,
  DatabaseIcon,
  FilesIcon,
  FolderPlusIcon,
  MonitorIcon,
  PlusIcon,
} from "lucide-react";
import type { ReactNode } from "react";
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
      deviceCount: new Set(allFolders.map((folder) => folder.source.host)).size,
    };
  }, [allFolders]);

  return (
    <div
      className={cn(
        "flex min-h-full flex-col overflow-x-hidden p-6",
        folders !== undefined ? "overflow-y-auto" : "overflow-hidden",
      )}
    >
      <div className="grid grid-cols-3 gap-6">
        <VaultStatCard
          icon={<DatabaseIcon />}
          title={t("stats.totalSize")}
          description={t("stats.totalSizeDescription")}
          value={stats ? formatSize(stats.totalSize) : undefined}
          isLoading={!vault || !stats}
        />
        <VaultStatCard
          icon={<FilesIcon />}
          title={t("stats.files")}
          description={t("stats.filesDescription")}
          value={stats ? formatInt(stats.fileCount) : undefined}
          isLoading={!vault || !stats}
        />
        <VaultStatCard
          icon={<MonitorIcon />}
          title={t("stats.devices")}
          description={t("stats.devicesDescription")}
          value={stats ? formatInt(stats.deviceCount) : undefined}
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
  icon: ReactNode;
  title: string;
  description: string;
  value?: string;
  isLoading: boolean;
  accent: "cyan" | "emerald" | "amber";
};

function VaultStatCard({
  icon,
  title,
  description,
  value,
  isLoading,
  accent,
}: VaultStatCardProps) {
  return (
    <Card
      className={cn(
        "relative min-h-32 overflow-hidden py-0",
        "before:absolute before:inset-x-0 before:top-0 before:h-1",
        accent === "cyan" && "before:bg-cyan-500/80 dark:before:bg-cyan-400/80",
        accent === "emerald" &&
          "before:bg-emerald-500/80 dark:before:bg-emerald-400/80",
        accent === "amber" &&
          "before:bg-amber-500/80 dark:before:bg-amber-400/80",
      )}
    >
      <CardContent className="relative flex h-full flex-col justify-between p-5">
        <div className="flex items-start justify-between gap-4">
          <div className="flex min-w-0 flex-col">
            <CardTitle className="text-muted-foreground text-sm font-medium">
              {!isLoading ? title : <Skeleton width={90} />}
            </CardTitle>
            <p className="mt-2 truncate text-4xl font-semibold tracking-normal">
              {!isLoading ? value : <Skeleton width={120} />}
            </p>
          </div>
          <div
            className={cn(
              "flex size-11 shrink-0 items-center justify-center rounded-lg border [&_svg]:size-5",
              accent === "cyan" &&
                "border-cyan-500/20 bg-cyan-500/10 text-cyan-700 dark:text-cyan-300",
              accent === "emerald" &&
                "border-emerald-500/20 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300",
              accent === "amber" &&
                "border-amber-500/20 bg-amber-500/10 text-amber-700 dark:text-amber-300",
            )}
          >
            {icon}
          </div>
        </div>
        <p className="text-muted-foreground mt-4 truncate text-xs">
          {!isLoading ? description : <Skeleton width={150} />}
        </p>
      </CardContent>
    </Card>
  );
}
