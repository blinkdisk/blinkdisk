import { useBackupList } from "@desktop/hooks/queries/core/use-backup-list";

export function useCompletedBackupList() {
  const { data: backups, ...rest } = useBackupList();

  const data = backups?.filter((backup) => backup.incomplete === undefined);

  return {
    data,
    ...rest,
  };
}
