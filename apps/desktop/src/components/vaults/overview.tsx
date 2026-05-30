import { useAppTranslation } from "@blinkdisk/hooks/use-app-translation";
import { Skeleton } from "@blinkdisk/ui/skeleton";
import { cn } from "@blinkdisk/utils/class";
import { HealthCard } from "@desktop/components/accounts/health-card";
import { StorageCard } from "@desktop/components/accounts/storage-card";
import { Empty } from "@desktop/components/empty";
import { FolderList } from "@desktop/components/folders/list";
import { LocalButton } from "@desktop/components/vaults/local-button";
import { useStartBackup } from "@desktop/hooks/mutations/core/use-start-backup";
import type { CoreFolderItem } from "@desktop/hooks/queries/core/use-folder-list";
import type { VaultItem } from "@desktop/hooks/queries/use-vault";
import { useCreateFolderDialog } from "@desktop/hooks/state/use-create-folder-dialog";
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

  const isAnyBackupRunning = useMemo(
    () =>
      folders?.some(
        (folder) =>
          folder.status === "UPLOADING" || folder.status === "PENDING",
      ),
    [folders],
  );

  return (
    <div
      className={cn(
        "flex min-h-full flex-col overflow-x-hidden p-6",
        folders !== undefined ? "overflow-y-auto" : "overflow-hidden",
      )}
    >
      <div className="flex flex-row gap-6">
        <HealthCard isLoading={!vault} />
        {!vault || (vault && vault.provider === "CLOUDBLINK") ? (
          <StorageCard isLoading={!vault} />
        ) : null}
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
