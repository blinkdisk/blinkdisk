import { useBackupList } from "@desktop/hooks/queries/core/use-backup-list";
import { useBackupId } from "@desktop/hooks/use-backup-id";

export function useBackup() {
  const { data: backups } = useBackupList();
  const { backupId } = useBackupId();

  const backup = backups?.find((backup) => backup.id === backupId);

  return { data: backup };
}
