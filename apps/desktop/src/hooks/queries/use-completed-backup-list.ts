import { useBackupList } from "@desktop/hooks/queries/core/use-backup-list";
import { useMemo } from "react";

export function useCompletedBackupList() {
  const { data: backups, ...rest } = useBackupList();

  const data = useMemo(() => {
    return backups?.filter((backup) => backup.incomplete === undefined);
  }, [backups]);

  return {
    data,
    ...rest,
  };
}
