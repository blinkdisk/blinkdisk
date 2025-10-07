import { FolderPreview } from "@desktop/components/folders/preview";
import { CoreFolderItem } from "@desktop/hooks/queries/core/use-folder-list";
import { useRelativeTime } from "@desktop/hooks/use-relative-time";
import { Link } from "@tanstack/react-router";
import { Skeleton } from "@ui/skeleton";
import { ArrowRightIcon } from "lucide-react";

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
  const formattedTime = useRelativeTime(folder?.lastSnapshot?.startTime);

  return (
    <Link
      to="/app/{-$deviceId}/{-$profileId}/{-$vaultId}/{-$folderId}"
      params={(params) => ({
        ...params,
        folderId: folder?.id || "",
      })}
      className="bg-card hover:bg-card-hover ring-ring flex flex-row items-center justify-between gap-2 rounded-2xl border p-4 outline-none focus-visible:ring-2"
    >
      <FolderPreview folder={folder} />
      <div className="flex items-center gap-3">
        {folder && !folder.lastSnapshot ? null : (
          <p className="text-muted-foreground whitespace-nowrap text-sm">
            {folder ? formattedTime : <Skeleton width={100} />}
          </p>
        )}
        <div className="h-6 border-r" />
        {folder ? (
          <ArrowRightIcon className="text-foreground/50 size-5" />
        ) : (
          <Skeleton width="1.25rem" height="1.25rem" />
        )}
      </div>
    </Link>
  );
}
