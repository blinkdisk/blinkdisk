import type { CoreBackupItem } from "@desktop/hooks/queries/core/use-backup-list";
import type { CoreSourceItem } from "@desktop/hooks/queries/core/use-source-list";
import {
  buildVaultStatHistory,
  buildVaultStats,
} from "@desktop/lib/vault-stats";

const emptySnapshotStats = {
  totalSize: 0,
  excludedTotalSize: 0,
  fileCount: 0,
  cachedFiles: 0,
  nonCachedFiles: 0,
  dirCount: 0,
  excludedFileCount: 0,
  excludedDirCount: 0,
  ignoredErrorCount: 0,
  errorCount: 0,
};

function source(overrides: Partial<CoreSourceItem>): CoreSourceItem {
  return {
    id: "source",
    type: "directory",
    source: {
      host: "device",
      userName: "paul",
      path: "/Users/paul/Documents",
    },
    status: "IDLE",
    schedule: { runMissed: false },
    currentTask: "",
    currentTaskStatus: "SUCCESS",
    ...overrides,
  } as CoreSourceItem;
}

function lastSnapshot(
  overrides: Partial<CoreSourceItem["lastSnapshot"]> = {},
): CoreSourceItem["lastSnapshot"] {
  return {
    id: "snapshot",
    description: "",
    startTime: new Date().toISOString(),
    endTime: new Date().toISOString(),
    folder: {
      host: "device",
      userName: "paul",
      path: "/Users/paul/Documents",
    },
    stats: emptySnapshotStats,
    rootEntry: {
      name: "Documents",
      type: "d",
      mode: "",
      mtime: new Date().toISOString(),
      uid: 0,
      gid: 0,
      obj: "root",
    },
    ...overrides,
  };
}

describe("buildVaultStats", () => {
  it("counts file and symlink roots as protected files", () => {
    const stats = buildVaultStats([
      source({
        type: "file",
        lastSnapshot: lastSnapshot({
          stats: {
            ...emptySnapshotStats,
            totalSize: 10,
          },
        }),
      }),
      source({
        type: "symlink",
        lastSnapshot: lastSnapshot({
          stats: {
            ...emptySnapshotStats,
            totalSize: 20,
          },
        }),
      }),
      source({
        type: "directory",
        lastSnapshot: lastSnapshot({
          stats: {
            ...emptySnapshotStats,
            totalSize: 30,
            cachedFiles: 2,
            nonCachedFiles: 3,
            dirCount: 4,
          },
          rootEntry: {
            name: "Documents",
            type: "d",
            mode: "",
            mtime: new Date().toISOString(),
            uid: 0,
            gid: 0,
            obj: "root",
            summ: {
              size: 30,
              files: 5,
              symlinks: 1,
              dirs: 4,
              maxTime: new Date().toISOString(),
              numFailed: 0,
            },
          },
        }),
      }),
    ]);

    expect(stats).toEqual({
      totalSize: 60,
      fileCount: 8,
      directoryCount: 4,
    });
  });
});

describe("buildVaultStatHistory", () => {
  it("counts symlinks as files in backup history", () => {
    const history = buildVaultStatHistory([
      {
        id: "backup",
        description: "",
        startTime: new Date().toISOString(),
        endTime: new Date().toISOString(),
        rootID: "root",
        rootEntryType: "d",
        retention: [],
        pins: [],
        summary: {
          size: 50,
          files: 2,
          symlinks: 1,
          dirs: 1,
          maxTime: new Date().toISOString(),
          numFailed: 0,
        },
      } as CoreBackupItem,
    ]);

    expect(history.fileCount.at(-1)).toBe(3);
  });
});
