import { useBackupList } from "@desktop/hooks/queries/core/use-backup-list";
import { useMemo } from "react";

export function usePausedBackup() {
  const { data: backups } = useBackupList();

  const data = useMemo(() => {
    if (!backups || !backups.length) return null;
    if (backups[0]?.incomplete !== "checkpoint") return null;
    return backups[0];
  }, [backups]);

  return { data };
}
