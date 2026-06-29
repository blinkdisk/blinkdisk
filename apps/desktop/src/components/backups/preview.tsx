import { SourceCard } from "@blinkdisk/components/source-card";
import type { CoreBackupItem } from "@desktop/hooks/queries/core/use-backup-list";
import type { CoreSourceItem } from "@desktop/hooks/queries/core/use-source-list";
import { useTheme } from "@desktop/hooks/use-theme";
import { formatBackupDate } from "@desktop/lib/backup";

type BackupPreviewProps = {
  backup: CoreBackupItem;
  source: CoreSourceItem;
};

export function BackupPreview({ backup, source }: BackupPreviewProps) {
  const { dark } = useTheme();

  return (
    <div className="flex w-full min-w-0 items-center gap-4">
      <SourceCard
        emoji={source.emoji}
        type={source.type}
        size={2.8}
        theme={dark ? "dark" : "light"}
      />
      <div className="flex w-full flex-col">
        <span className="text-muted-foreground ph-no-capture min-w-0 max-w-full truncate text-sm font-normal">
          {source.name || source.source.path}
        </span>
        <span className="ph-no-capture max-w-full truncate text-lg font-semibold">
          {formatBackupDate(backup)}
        </span>
      </div>
    </div>
  );
}
