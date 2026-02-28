export function getBackupDisplayName(backup: {
  description: string;
  startTime: string;
}): string {
  if (backup.description) return backup.description;
  return formatBackupDate(backup);
}

export function formatBackupDate(backup: { startTime: string }): string {
  return new Date(backup.startTime).toLocaleString(undefined, {
    timeStyle: "short",
    dateStyle: "short",
  });
}
