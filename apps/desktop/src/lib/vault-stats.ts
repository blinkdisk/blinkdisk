import type { CoreBackupItem } from "@desktop/hooks/queries/core/use-backup-list";
import type { CoreSourceItem } from "@desktop/hooks/queries/core/use-source-list";

function sourceSummary(source: CoreSourceItem) {
  return source.lastSnapshot?.rootEntry?.summ;
}

function sourceFileCount(source: CoreSourceItem) {
  const statsFileCount =
    (source.lastSnapshot?.stats.nonCachedFiles || 0) +
    (source.lastSnapshot?.stats.cachedFiles || 0);
  const summaryFileCount =
    (sourceSummary(source)?.files || 0) +
    (sourceSummary(source)?.symlinks || 0);

  if (statsFileCount > 0) {
    return statsFileCount + (sourceSummary(source)?.symlinks || 0);
  }

  if (summaryFileCount > 0) {
    return summaryFileCount;
  }

  return source.lastSnapshot &&
    (source.type === "file" || source.type === "symlink")
    ? 1
    : 0;
}

export function buildVaultStats(sources: CoreSourceItem[]) {
  return {
    totalSize: sources.reduce(
      (sum, source) =>
        sum +
        (source.lastSnapshot?.stats.totalSize ||
          sourceSummary(source)?.size ||
          0),
      0,
    ),
    fileCount: sources.reduce(
      (sum, source) => sum + sourceFileCount(source),
      0,
    ),
    directoryCount: sources.reduce(
      (sum, source) =>
        sum +
        (source.lastSnapshot?.stats.dirCount ||
          sourceSummary(source)?.dirs ||
          0),
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
          fileCount:
            sum.fileCount + backup.summary.files + backup.summary.symlinks,
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
