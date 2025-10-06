import { useParams } from "@tanstack/react-router";

export function useBackupId() {
  const { backupId } = useParams({ strict: false });
  return { backupId };
}
