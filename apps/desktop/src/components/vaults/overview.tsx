import { useAppTranslation } from "@blinkdisk/hooks/use-app-translation";
import { Skeleton } from "@blinkdisk/ui/skeleton";
import { cn } from "@blinkdisk/utils/class";
import { Empty } from "@desktop/components/empty";
import { FolderList } from "@desktop/components/folders/list";
import { LocalButton } from "@desktop/components/vaults/local-button";
import { VaultStatCard } from "@desktop/components/vaults/stat-card";
import { useStartBackup } from "@desktop/hooks/mutations/core/use-start-backup";
import { useBackupList } from "@desktop/hooks/queries/core/use-backup-list";
import {
  type CoreFolderItem,
  useFolderList,
} from "@desktop/hooks/queries/core/use-folder-list";
import type { VaultItem } from "@desktop/hooks/queries/use-vault";
import { useCreateFolderDialog } from "@desktop/hooks/state/use-create-folder-dialog";
import { formatCompactInt, formatSize } from "@desktop/lib/number";
import {
  buildVaultStatHistory,
  buildVaultStats,
} from "@desktop/lib/vault-stats";
import { CloudUploadIcon, FolderPlusIcon, PlusIcon } from "lucide-react";
import { useMemo } from "react";

type VaultOverviewProps = {
  vault?: VaultItem;
  folders?: CoreFolderItem[];
};

export function VaultOverview({ vault, folders }: VaultOverviewProps) {
  const { t } = useAppTranslation("vault.overview");

  const { openCreateFolder } = useCreateFolderDialog();
  const { mutate: startBackup, isPending: isStartingBackup } = useStartBackup();
  const { data: allFolders } = useFolderList({ unfiltered: true });
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

    return buildVaultStats(allFolders);
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
          value={stats ? formatSize(stats.totalSize) : undefined}
          history={statHistory?.totalSize}
          isLoading={!vault || !stats}
        />
        <VaultStatCard
          title={t("stats.files")}
          value={stats ? formatCompactInt(stats.fileCount) : undefined}
          history={statHistory?.fileCount}
          isLoading={!vault || !stats}
        />
        <VaultStatCard
          title={t("stats.directories")}
          value={stats ? formatCompactInt(stats.directoryCount) : undefined}
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
