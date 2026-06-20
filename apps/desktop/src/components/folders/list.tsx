import { useAppTranslation } from "@blinkdisk/hooks/use-app-translation";
import { Button } from "@blinkdisk/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@blinkdisk/ui/dropdown-menu";
import { Skeleton } from "@blinkdisk/ui/skeleton";
import { BackupProgress } from "@desktop/components/backups/progress";
import { FolderPreview } from "@desktop/components/folders/preview";
import { useCancelBackup } from "@desktop/hooks/mutations/core/use-cancel-backup";
import { useStartBackup } from "@desktop/hooks/mutations/core/use-start-backup";
import type { CoreFolderItem } from "@desktop/hooks/queries/core/use-folder-list";
import { useDeleteFolderDialog } from "@desktop/hooks/state/use-delete-folder-dialog";
import { useFolderSettingsDialog } from "@desktop/hooks/state/use-folder-settings-dialog";
import type { ProfileFilter } from "@desktop/hooks/use-profile";
import { useRelativeTime } from "@desktop/hooks/use-relative-time";
import { formatInt, formatSize } from "@desktop/lib/number";
import { Link } from "@tanstack/react-router";
import {
  CloudUploadIcon,
  FolderSearchIcon,
  MoreVerticalIcon,
  SettingsIcon,
  SquareIcon,
  TrashIcon,
} from "lucide-react";
import { useMemo } from "react";

type FolderListProps = {
  folders: CoreFolderItem[] | undefined | null;
  profileFilter?: ProfileFilter;
  allowBackupActions?: boolean;
};

export function FolderList({
  folders,
  profileFilter,
  allowBackupActions = true,
}: FolderListProps) {
  return (
    <div className="mt-6 flex flex-col gap-3">
      {(folders === undefined || folders === null
        ? (new Array(20).fill(undefined) as undefined[])
        : folders
      ).map((folder, index) => (
        <Folder
          key={folder ? folder.id : index}
          folder={folder}
          profileFilter={profileFilter}
          allowBackupActions={allowBackupActions}
        />
      ))}
    </div>
  );
}

type FolderProps = {
  folder: CoreFolderItem | undefined;
  profileFilter?: ProfileFilter;
  allowBackupActions: boolean;
};

function Folder({ folder, profileFilter, allowBackupActions }: FolderProps) {
  const { t } = useAppTranslation("folder.list.item");
  const formattedTime = useRelativeTime(folder?.lastSnapshot?.startTime);

  const { mutate: startBackup } = useStartBackup({ profileFilter });
  const { mutate: cancelBackup } = useCancelBackup({ profileFilter });
  const { openFolderSettings } = useFolderSettingsDialog();
  const { openDeleteFolderDialog } = useDeleteFolderDialog();

  const showProgress = useMemo(
    () =>
      folder &&
      folder.status === "UPLOADING" &&
      folder.currentTaskStatus !== "CANCELING",
    [folder],
  );

  const showStartTime = useMemo(
    () => folder?.lastSnapshot && !folder.lastSnapshot.incomplete,
    [folder],
  );

  const folderProfileFilter: ProfileFilter | undefined = folder
    ? {
        host: folder.source.host,
        userName: folder.source.userName,
      }
    : profileFilter;

  const folderRouteParams = (params: {
    accountId?: string;
    vaultId?: string;
    hostName?: string;
    userName?: string;
    folderId?: string;
  }) => ({
    ...params,
    hostName: folder?.source.host || params.hostName,
    userName: folder?.source.userName || params.userName,
    folderId: folder?.id || "",
  });

  return (
    <div className="bg-card hover:bg-card-hover ring-ring relative flex flex-row items-center justify-between gap-2 rounded-2xl border p-4 outline-none transition-colors focus-visible:ring-2">
      <Link
        to="/{-$accountId}/{-$vaultId}/{-$hostName}/{-$userName}/{-$folderId}"
        params={folderRouteParams}
        className="absolute inset-0"
      />
      <FolderPreview folder={folder} />
      <div className="flex items-center gap-3">
        {showStartTime || showProgress ? (
          <>
            {showProgress && folder ? (
              <BackupProgress upload={folder.upload} size="sm" />
            ) : showStartTime ? (
              <div className="flex flex-col items-end gap-0.5">
                <p className="text-foreground whitespace-nowrap text-sm">
                  {folder ? formattedTime : <Skeleton width={100} />}
                </p>
                {folder?.lastSnapshot ? (
                  <p className="text-muted-foreground whitespace-nowrap text-xs">
                    {t("stats", {
                      fileCount: formatInt(
                        (folder.lastSnapshot.stats?.cachedFiles || 0) +
                          (folder.lastSnapshot.stats?.nonCachedFiles || 0),
                      ),
                      size: formatSize(
                        folder.lastSnapshot.stats?.totalSize || 0,
                      ),
                    })}
                  </p>
                ) : null}
              </div>
            ) : null}
            <div className={showStartTime ? "h-8 border-r" : "h-6 border-r"} />
          </>
        ) : null}
        {folder ? (
          <DropdownMenu>
            <DropdownMenuTrigger
              render={
                <Button
                  size="icon-sm"
                  className="[&_svg]:size-5"
                  variant="ghost"
                >
                  <MoreVerticalIcon />
                </Button>
              }
            />
            <DropdownMenuContent className="w-48" align="end">
              <DropdownMenuItem
                render={
                  <Link
                    to="/{-$accountId}/{-$vaultId}/{-$hostName}/{-$userName}/{-$folderId}"
                    params={folderRouteParams}
                  >
                    <FolderSearchIcon />
                    {t("dropdown.browse")}
                  </Link>
                }
              />
              <DropdownMenuSeparator />
              <DropdownMenuGroup>
                {allowBackupActions &&
                folder.status === "UPLOADING" &&
                folder.currentTaskStatus !== "CANCELING" ? (
                  <DropdownMenuItem
                    onClick={() => cancelBackup({ taskId: folder.currentTask })}
                  >
                    <SquareIcon />
                    {t("dropdown.cancel")}
                  </DropdownMenuItem>
                ) : allowBackupActions &&
                  ["IDLE", "REMOTE"].includes(folder.status) ? (
                  <DropdownMenuItem
                    onClick={() => startBackup({ path: folder.source.path })}
                  >
                    <CloudUploadIcon />
                    {t("dropdown.backup")}
                  </DropdownMenuItem>
                ) : null}
                <DropdownMenuItem
                  onClick={() =>
                    openFolderSettings({
                      folderId: folder.id,
                      profileFilter: folderProfileFilter,
                    })
                  }
                >
                  <SettingsIcon />
                  {t("dropdown.settings")}
                </DropdownMenuItem>
              </DropdownMenuGroup>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() =>
                  openDeleteFolderDialog({
                    folderId: folder.id,
                    profileFilter: folderProfileFilter,
                  })
                }
                variant="destructive"
              >
                <TrashIcon />
                {t("dropdown.delete")}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        ) : (
          <Skeleton width="1.25rem" height="1.25rem" />
        )}
      </div>
    </div>
  );
}
