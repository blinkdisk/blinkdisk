import type { CoreBackupItem } from "@desktop/hooks/queries/core/use-backup-list";
import type { CoreFolderItem } from "@desktop/hooks/queries/core/use-folder-list";

export function buildVaultStats(folders: CoreFolderItem[]) {
  return {
    totalSize: folders.reduce(
      (sum, folder) => sum + (folder.lastSnapshot?.stats.totalSize || 0),
      0,
    ),
    fileCount: folders.reduce(
      (sum, folder) =>
        sum +
        (folder.lastSnapshot?.stats.nonCachedFiles || 0) +
        (folder.lastSnapshot?.stats.cachedFiles || 0),
      0,
    ),
    directoryCount: folders.reduce(
      (sum, folder) => sum + (folder.lastSnapshot?.stats.dirCount || 0),
      0,
    ),
  };
}

export function buildVaultStatHistory(backups: CoreBackupItem[]) {
  const days = Array.from({ length: 30 }, (_, index) => {
    const date = new Date();
    date.setHours(0, 0, 0, 0);
    date.setDate(date.getDate() - (29 - index));
    return date;
  });
  const sortedBackups = [...backups]
    .filter((backup) => backup.incomplete === undefined)
    .sort(
      (a, b) =>
        new Date(a.startTime).getTime() - new Date(b.startTime).getTime(),
    );
  const latestByRoot = new Map<string, CoreBackupItem>();
  let backupIndex = 0;

  return days.reduce(
    (history, day) => {
      const nextDay = new Date(day);
      nextDay.setDate(day.getDate() + 1);

      while (backupIndex < sortedBackups.length) {
        const backup = sortedBackups[backupIndex];
        if (!backup || new Date(backup.startTime) >= nextDay) break;

        latestByRoot.set(backup.rootID, backup);
        backupIndex += 1;
      }

      const totals = Array.from(latestByRoot.values()).reduce(
        (sum, backup) => ({
          totalSize: sum.totalSize + backup.summary.size,
          fileCount: sum.fileCount + backup.summary.files,
          directoryCount: sum.directoryCount + backup.summary.dirs,
        }),
        { totalSize: 0, fileCount: 0, directoryCount: 0 },
      );

      history.totalSize.push(totals.totalSize);
      history.fileCount.push(totals.fileCount);
      history.directoryCount.push(totals.directoryCount);

      return history;
    },
    {
      totalSize: [] as number[],
      fileCount: [] as number[],
      directoryCount: [] as number[],
    },
  );
}
