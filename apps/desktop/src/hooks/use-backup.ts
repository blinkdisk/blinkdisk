import { useBackupList } from "#hooks/queries/core/use-backup-list";
import { useBackupId } from "#hooks/use-backup-id";
import { useMemo } from "react";

export function useBackup() {
  const { data: backups } = useBackupList();
  const { backupId } = useBackupId();

  const backup = useMemo(() => {
    return backups?.find((backup) => backup.id === backupId);
  }, [backups, backupId]);

  return { data: backup };
}
