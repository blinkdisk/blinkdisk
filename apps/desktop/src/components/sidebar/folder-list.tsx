import { FolderPreview } from "@desktop/components/folders/preview";
import { useVaultStatus } from "@desktop/hooks/queries/use-vault-status";
import { FolderItem } from "@desktop/hooks/use-folder-list";
import { useAppTranslation } from "@hooks/use-app-translation";
import { Link, useParams } from "@tanstack/react-router";
import {
  SidebarGroupLabel,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@ui/sidebar";

type SidebarFolderListProps = {
  folders: FolderItem[] | undefined | null;
};

export function SidebarFolderList({ folders }: SidebarFolderListProps) {
  const { t } = useAppTranslation("sidebar.folderList");

  const { data: status } = useVaultStatus();

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
  folder: FolderItem | undefined;
};

function SidebarFolder({ folder }: SidebarFolderProps) {
  const { folderId } = useParams({
    strict: false,
  });

  return (
    <SidebarMenuItem>
      <SidebarMenuButton
        className="h-12"
        asChild
        isActive={folder && folderId === folder?.id}
      >
        <Link
          to="/app/{-$deviceId}/{-$profileId}/{-$vaultId}/{-$folderId}"
          params={(params) => ({
            ...params,
            folderId: folder?.id || "",
          })}
        >
          <FolderPreview folder={folder} size="sm" />
        </Link>
      </SidebarMenuButton>
    </SidebarMenuItem>
  );
}
