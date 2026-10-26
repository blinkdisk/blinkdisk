import { useAppTranslation } from "@blinkdisk/hooks/use-app-translation";
import { isFileLikeSource } from "@blinkdisk/schemas/source";
import type { CoreSourceItem } from "@desktop/hooks/queries/core/use-source-list";
import type { BackupIssueReason } from "@desktop/lib/backup-issue";

export function useBackupIssueText() {
  const { t } = useAppTranslation("folder.backupError");

  return (source: CoreSourceItem, reason: BackupIssueReason) => {
    const sourceTypeKey = isFileLikeSource(source.type) ? "file" : "folder";

    return {
      label: t(`label.${reason}.${sourceTypeKey}`),
      description: t(`description.${reason}.${sourceTypeKey}`),
    };
  };
}
