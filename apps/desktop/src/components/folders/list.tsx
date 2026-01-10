import { BackupProgress } from "@desktop/components/backups/progress";
import { FolderPreview } from "@desktop/components/folders/preview";
import { LocalDropdownMenuItem } from "@desktop/components/vaults/local-dropdown-item";
import { useCancelBackup } from "@desktop/hooks/mutations/core/use-cancel-backup";
import { useStartBackup } from "@desktop/hooks/mutations/core/use-start-backup";
import { CoreFolderItem } from "@desktop/hooks/queries/core/use-folder-list";
import { useDeleteFolderDialog } from "@desktop/hooks/state/use-delete-folder-dialog";
import { useFolderSettingsDialog } from "@desktop/hooks/state/use-folder-settings-dialog";
import { useRelativeTime } from "@desktop/hooks/use-relative-time";
import { useAppTranslation } from "@hooks/use-app-translation";
import { Link } from "@tanstack/react-router";
import { Button } from "@ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@ui/dropdown-menu";
import { Skeleton } from "@ui/skeleton";
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
};

export function FolderList({ folders }: FolderListProps) {
  return (
    <div className="mt-6 flex flex-col gap-3">
      {(folders === undefined || folders === null
        ? (new Array(20).fill(undefined) as undefined[])
        : folders
      ).map((folder, index) => (
        <Folder key={folder ? folder.id : index} folder={folder} />
      ))}
    </div>
  );
}

type FolderProps = {
  folder: CoreFolderItem | undefined;
};

function Folder({ folder }: FolderProps) {
  const { t } = useAppTranslation("folder.list.item");
  const formattedTime = useRelativeTime(folder?.lastSnapshot?.startTime);

  const { mutate: startBackup } = useStartBackup();
  const { mutate: cancelBackup } = useCancelBackup();
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
    () => folder && folder.lastSnapshot && !folder.lastSnapshot.incomplete,
    [folder],
  );

  return (
    <div
      role="link"
      className="bg-card hover:bg-card-hover ring-ring relative flex flex-row items-center justify-between gap-2 rounded-2xl border p-4 outline-none focus-visible:ring-2"
    >
      <Link
        to="/app/{-$vaultId}/{-$hostName}/{-$userName}/{-$folderId}"
        params={(params) => ({
          ...params,
          folderId: folder?.id || "",
        })}
        className="absolute inset-0"
      />
      <FolderPreview folder={folder} />
      <div className="flex items-center gap-3">
        {showStartTime || showProgress ? (
          <>
            {showProgress && folder ? (
              <BackupProgress upload={folder.upload} size="sm" />
            ) : showStartTime ? (
              <p className="text-muted-foreground whitespace-nowrap text-sm">
                {folder ? formattedTime : <Skeleton width={100} />}
              </p>
            ) : null}
            <div className="h-6 border-r" />
          </>
        ) : null}
        {folder ? (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button size="icon-sm" className="[&_svg]:size-5" variant="ghost">
                <MoreVerticalIcon />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-48" align="end">
              <DropdownMenuItem asChild>
                <Link
                  to="/app/{-$vaultId}/{-$hostName}/{-$userName}/{-$folderId}"
                  params={(params) => ({
                    ...params,
                    folderId: folder?.id || "",
                  })}
                >
                  <FolderSearchIcon />
                  {t("dropdown.browse")}
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuGroup>
                {folder.status === "UPLOADING" &&
                folder.currentTaskStatus !== "CANCELING" ? (
                  <LocalDropdownMenuItem
                    onClick={() => cancelBackup({ taskId: folder.currentTask })}
                  >
                    <SquareIcon />
                    {t("dropdown.cancel")}
                  </LocalDropdownMenuItem>
                ) : ["IDLE", "REMOTE"].includes(folder.status) ? (
                  <LocalDropdownMenuItem
                    onClick={() => startBackup({ path: folder.source.path })}
                  >
                    <CloudUploadIcon />
                    {t("dropdown.backup")}
                  </LocalDropdownMenuItem>
                ) : null}
                <DropdownMenuItem
                  onClick={() => openFolderSettings({ folderId: folder.id })}
                >
                  <SettingsIcon />
                  {t("dropdown.settings")}
                </DropdownMenuItem>
              </DropdownMenuGroup>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => openDeleteFolderDialog({ folderId: folder.id })}
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
