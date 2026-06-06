import { FolderCard } from "@blinkdisk/components/folder-card";
import type { CoreBackupItem } from "@desktop/hooks/queries/core/use-backup-list";
import type { CoreFolderItem } from "@desktop/hooks/queries/core/use-folder-list";
import { useTheme } from "@desktop/hooks/use-theme";
import { formatBackupDate } from "@desktop/lib/backup";

type BackupPreviewProps = {
  backup: CoreBackupItem;
  folder: CoreFolderItem;
};

export function BackupPreview({ backup, folder }: BackupPreviewProps) {
  const { dark } = useTheme();

  return (
    <div className="flex w-full min-w-0 items-center gap-4">
      <FolderCard
        emoji={folder.emoji}
        size={5}
        theme={dark ? "dark" : "light"}
      />
      <div className="flex w-full flex-col">
        <span className="text-muted-foreground ph-no-capture min-w-0 max-w-full truncate text-sm font-normal">
          {folder.name || folder.source.path}
        </span>
        <span className="ph-no-capture max-w-full truncate text-lg font-semibold">
          {formatBackupDate(backup)}
        </span>
      </div>
    </div>
  );
}
