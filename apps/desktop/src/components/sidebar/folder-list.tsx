import { FolderPreview } from "#components/folders/preview";
import { CoreFolderItem } from "#hooks/queries/core/use-folder-list";
import { useVaultStatus } from "#hooks/queries/use-vault-status";
import { useAppTranslation } from "@blinkdisk/hooks/use-app-translation";
import { Link, useParams } from "@tanstack/react-router";
import { CircularProgress } from "@blinkdisk/ui/circular-progress";
import { Loader } from "@blinkdisk/ui/loader";
import {
  SidebarGroupLabel,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@blinkdisk/ui/sidebar";

type SidebarFolderListProps = {
  folders: CoreFolderItem[] | undefined | null;
};

export function SidebarFolderList({ folders }: SidebarFolderListProps) {
  const { t } = useAppTranslation("sidebar.folderList");

  const { status } = useVaultStatus();

  if (!["STARTING", "RUNNING"].includes(status || "")) return null;
  if (folders !== undefined && folders !== null && !folders.length) return null;
  return (
    <div className="mt-4 flex flex-col">
      <SidebarGroupLabel>{t("title")}</SidebarGroupLabel>
      <div className="flex flex-col gap-2">
        {(folders === undefined || folders === null
          ? (new Array(3).fill(undefined) as undefined[])
          : folders
        ).map((folder, index) => (
          <SidebarFolder key={folder ? folder.id : index} folder={folder} />
        ))}
      </div>
    </div>
  );
}

type SidebarFolderProps = {
  folder: CoreFolderItem | undefined;
};

function SidebarFolder({ folder }: SidebarFolderProps) {
  const { folderId } = useParams({
    strict: false,
  });

  return (
    <SidebarMenuItem>
      <SidebarMenuButton
        className="h-12"
        isActive={folder && folderId === folder?.id}
        render={
          <Link
            to="/app/{-$vaultId}/{-$hostName}/{-$userName}/{-$folderId}"
            params={(params) => ({
              ...params,
              folderId: folder?.id || "",
            })}
            className="flex items-center justify-between"
          >
            <FolderPreview folder={folder} size="sm" />
            {folder &&
            folder.status === "UPLOADING" &&
            folder.currentTaskStatus !== "CANCELING" ? (
              folder.upload?.progress ? (
                <CircularProgress
                  value={100 * (folder?.upload?.progress || 0)}
                  size={25}
                  strokeWidth={4}
                  progressClassName="opacity-60 dark:opacity-70"
                />
              ) : (
                <Loader size={1.2} />
              )
            ) : null}
          </Link>
        }
      />
    </SidebarMenuItem>
  );
}
