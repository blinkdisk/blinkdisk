import type { CoreSourceItem } from "@desktop/hooks/queries/core/use-source-list";
import type { CoreTask } from "@desktop/hooks/queries/core/use-task";
import {
  createBackupResultTracker,
  getBackupIssue,
  getBackupIssueDetails,
} from "@desktop/lib/backup-issue";

function source(task?: Partial<CoreTask>, id = "photos"): CoreSourceItem {
  return {
    id,
    type: "directory",
    source: { host: "laptop", userName: "paul", path: "/photos" },
    status: "IDLE",
    schedule: { runMissed: false },
    currentTask: "",
    currentTaskStatus: "SUCCESS",
    lastBackupOutcome:
      task && (task.status === "FAILED" || task.status === "SUCCESS")
        ? {
            id: task.id || "1",
            status: task.status,
            startTime: "2026-10-24T10:00:00Z",
            endTime: "2026-10-24T10:01:00Z",
            errorMessage: task.errorMessage,
          }
        : undefined,
    lastSnapshotTask: task
      ? {
          id: "1",
          kind: "Snapshot",
          description: "",
          startTime: "2026-10-24T10:00:00Z",
          status: "SUCCESS",
          progressInfo: "",
          counters: null,
          ...task,
        }
      : undefined,
  };
}

describe("backup issues", () => {
  it("reports failures before a first snapshot, preserving the core error", () => {
    const failed = source({
      status: "FAILED",
      errorMessage: "lstat: source missing",
    });
    expect(getBackupIssue(failed)).toEqual({
      kind: "failed",
      reason: "failed",
      message: "lstat: source missing",
    });
  });

  it("explains missing sources and permission errors in plain language", () => {
    const reason = (errorMessage: string) =>
      getBackupIssue(source({ status: "FAILED", errorMessage }))?.reason;
    expect(
      reason(
        "unable to create local filesystem: lstat /photos: no such file or directory",
      ),
    ).toBe("missing");
    expect(
      reason(
        "unable to create local filesystem: CreateFile D:\\Photos: The system cannot find the path specified.",
      ),
    ).toBe("missing");
    expect(
      reason(
        "unable to create local filesystem: open /photos: permission denied",
      ),
    ).toBe("permission");
    expect(
      reason(
        "unable to create local filesystem: open D:\\Photos: Access is denied.",
      ),
    ).toBe("permission");
    expect(reason("unable to create local filesystem: Access denied")).toBe(
      "permission",
    );
    expect(reason("upload error: unexpected EOF")).toBe("failed");
  });

  it("does not mistake repository errors for missing or unreadable sources", () => {
    for (const errorMessage of [
      "repository not found",
      "bucket does not exist",
      "upload error: open /backup/storage: permission denied",
      "upload error: no such file or directory",
      "unable to create local filesystem: unexpected backend not found",
    ]) {
      expect(
        getBackupIssue(source({ status: "FAILED", errorMessage }))?.reason,
      ).toBe("failed");
    }
  });

  it("detects partial backups from directory summaries alone", () => {
    const partial = {
      ...source(),
      lastSnapshot: {
        stats: { errorCount: 0 },
        rootEntry: { summ: { numFailed: 2 } },
      },
    } as CoreSourceItem;
    expect(getBackupIssue(partial)?.kind).toBe("partial");
  });

  it("does not infer failure from idle, canceled, or running tasks", () => {
    expect(getBackupIssue()).toBeNull();
    expect(getBackupIssue(source())).toBeNull();
    for (const status of [
      "SUCCESS",
      "CANCELED",
      "RUNNING",
      "CANCELING",
    ] as const) {
      expect(
        getBackupIssue(source({ status, errorMessage: "old error" })),
      ).toBeNull();
    }
  });

  it("shows partial backup errors without a failed task", () => {
    const partial = {
      ...source(),
      lastSnapshot: { stats: { errorCount: 2 } },
    } as CoreSourceItem;
    expect(getBackupIssue(partial)?.kind).toBe("partial");
    expect(
      getBackupIssue({
        ...partial,
        lastSnapshotTask: source({ status: "CANCELED" }).lastSnapshotTask,
      })?.kind,
    ).toBe("partial");
  });

  it("retains failures during retries and after task history is lost", () => {
    const failed = source({
      status: "FAILED",
      errorMessage: "unable to create local filesystem: permission denied",
    });
    for (const status of ["IDLE", "PENDING", "UPLOADING"] as const) {
      expect(
        getBackupIssue({ ...failed, status, lastSnapshotTask: undefined })
          ?.reason,
      ).toBe("permission");
    }
  });

  it("uses a newer snapshot when a backup was created outside the server", () => {
    const failed = source({ status: "FAILED" });
    failed.lastSnapshot = {
      startTime: "2026-10-24T11:00:00Z",
      stats: { errorCount: 0 },
    } as NonNullable<CoreSourceItem["lastSnapshot"]>;
    expect(getBackupIssue(failed)).toBeNull();
    if (failed.lastSnapshot) failed.lastSnapshot.incomplete = "canceled";
    expect(getBackupIssue(failed)?.kind).toBe("failed");
  });
});

describe("backup issue details", () => {
  function partialSource() {
    return {
      ...source(),
      lastSnapshot: {
        id: "snapshot-1",
        folder: { host: "laptop", userName: "paul", path: "/photos" },
        description: "",
        startTime: "2026-10-24T10:00:01Z",
        endTime: "2026-10-24T10:00:59Z",
        stats: {
          totalSize: 0,
          excludedTotalSize: 0,
          fileCount: 0,
          cachedFiles: 0,
          nonCachedFiles: 0,
          dirCount: 1,
          excludedFileCount: 0,
          excludedDirCount: 0,
          ignoredErrorCount: 0,
          errorCount: 12,
        },
        rootEntry: {
          name: "photos",
          mode: "0755",
          mtime: "2026-10-24T10:00:00Z",
          uid: 1000,
          gid: 1000,
          obj: "root-object",
          summ: {
            size: 0,
            files: 0,
            symlinks: 0,
            dirs: 1,
            maxTime: "2026-10-24T10:00:00Z",
            numFailed: 12,
            numIgnoredErrors: 0,
            errors: [
              { path: "photos/private.jpg", error: "permission denied" },
              { path: "photos/locked.jpg", error: "file is in use" },
            ],
          },
        },
      },
    } satisfies CoreSourceItem;
  }

  it("reads saved paths and reasons after task history has been lost", () => {
    const partial = partialSource();
    expect(getBackupIssueDetails(partial)).toEqual({
      entries: partial.lastSnapshot?.rootEntry?.summ?.errors,
      totalCount: 12,
      ignoredErrorCount: 0,
      startTime: partial.lastSnapshot?.startTime,
      taskId: undefined,
      isTruncated: true,
    });
  });

  it("matches the snapshot to the persisted partial outcome", () => {
    const partial = partialSource();
    partial.lastBackupOutcome = {
      id: "partial-outcome",
      status: "PARTIAL",
      startTime: "2026-10-24T10:00:00Z",
      endTime: "2026-10-24T10:01:00Z",
      errorCount: 12,
    };
    expect(getBackupIssueDetails(partial)?.entries).toHaveLength(2);
    expect(getBackupIssueDetails(partial)?.startTime).toBe(
      partial.lastBackupOutcome.startTime,
    );
  });

  it("does not show older file errors for a later failed backup", () => {
    const failed = {
      ...partialSource(),
      lastBackupOutcome: {
        id: "later-failure",
        status: "FAILED" as const,
        startTime: "2026-10-24T11:00:00Z",
        endTime: "2026-10-24T11:01:00Z",
        errorMessage: "repository unavailable",
      },
    };
    expect(getBackupIssueDetails(failed)?.entries).toEqual([]);
    expect(getBackupIssueDetails(failed)?.totalCount).toBe(0);
  });

  it("does not attach older or incomplete snapshots to a partial outcome", () => {
    const partial = partialSource();
    partial.lastBackupOutcome = {
      id: "new-partial",
      status: "PARTIAL",
      startTime: "2026-10-24T11:00:00Z",
      endTime: "2026-10-24T11:01:00Z",
      errorCount: 3,
    };
    expect(getBackupIssueDetails(partial)?.entries).toEqual([]);
    expect(getBackupIssueDetails(partial)?.totalCount).toBe(3);
    partial.lastBackupOutcome.startTime = "2026-10-24T10:00:00Z";
    partial.lastBackupOutcome.endTime = "2026-10-24T10:01:00Z";
    expect(
      getBackupIssueDetails({
        ...partial,
        lastSnapshot: { ...partial.lastSnapshot, incomplete: "canceled" },
      })?.entries,
    ).toEqual([]);
  });

  it("uses errors from a newer externally created snapshot", () => {
    const partial = partialSource();
    partial.lastBackupOutcome = {
      id: "old-failure",
      status: "FAILED",
      startTime: "2026-10-23T10:00:00Z",
      endTime: "2026-10-23T10:01:00Z",
      errorMessage: "old error",
    };
    expect(getBackupIssueDetails(partial)?.entries).toHaveLength(2);
    expect(getBackupIssueDetails(partial)?.startTime).toBe(
      partial.lastSnapshot?.startTime,
    );
  });

  it("accounts for ignored errors included in the saved sample", () => {
    const partial = partialSource();
    const summary = partial.lastSnapshot.rootEntry.summ;
    summary.numIgnoredErrors = 2;
    expect(getBackupIssueDetails(partial)?.totalCount).toBe(14);
    expect(getBackupIssueDetails(partial)?.ignoredErrorCount).toBe(2);
    summary.numFailed = 0;
    partial.lastSnapshot.stats.errorCount = 0;
    expect(getBackupIssueDetails(partial)).toBeNull();
  });

  it("handles backups with a complete list or no saved file details", () => {
    const partial = partialSource();
    partial.lastSnapshot.stats.errorCount = 2;
    partial.lastSnapshot.rootEntry.summ.numFailed = 2;
    expect(getBackupIssueDetails(partial)?.isTruncated).toBe(false);
    partial.lastSnapshot.rootEntry.summ.errors = [];
    expect(getBackupIssueDetails(partial)?.entries).toEqual([]);
    expect(getBackupIssueDetails(partial)?.isTruncated).toBe(true);
  });

  it("only links logs from the same completed backup attempt", () => {
    const partial = partialSource();
    partial.lastSnapshotTask = source({
      id: "matching-task",
      endTime: "2026-10-24T10:01:00Z",
    }).lastSnapshotTask;
    if (!partial.lastSnapshotTask) throw new Error("Missing test task");
    expect(getBackupIssueDetails(partial)?.taskId).toBe("matching-task");
    partial.lastSnapshotTask.startTime = "2026-10-24T11:00:00Z";
    expect(getBackupIssueDetails(partial)?.taskId).toBeUndefined();
    partial.lastSnapshotTask.startTime = "2026-10-24T10:00:00Z";
    partial.lastSnapshotTask.status = "RUNNING";
    expect(getBackupIssueDetails(partial)?.taskId).toBeUndefined();
  });

  it("matches task timestamps against the persisted outcome", () => {
    const failed = source({
      status: "FAILED",
      endTime: "2026-10-24T10:01:00Z",
      errorMessage: "permission denied",
    });
    expect(getBackupIssueDetails(failed)?.taskId).toBe("1");
    if (!failed.lastSnapshotTask) throw new Error("Missing test task");
    failed.lastSnapshotTask.endTime = "2026-10-24T10:02:00Z";
    expect(getBackupIssueDetails(failed)?.taskId).toBeUndefined();
  });
});

describe("manual backup feedback", () => {
  it("catches failures between polls and only reports each new result once", () => {
    const tracker = createBackupResultTracker();
    const old = source({ id: "1", status: "FAILED" });
    tracker.start([old]);
    expect(tracker.observe([old])).toEqual([]);
    const failed = source({
      id: "2",
      status: "FAILED",
      errorMessage: "access denied",
    });
    expect(tracker.observe([failed])).toEqual([failed]);
    expect(tracker.observe([failed])).toEqual([]);
  });

  it("recognizes a new outcome when task IDs are reused after restart", () => {
    const tracker = createBackupResultTracker();
    const old = source({ id: "1", status: "FAILED" });
    tracker.start([old]);
    if (!old.lastBackupOutcome) throw new Error("Missing test outcome");
    const next = {
      ...old,
      lastBackupOutcome: { ...old.lastBackupOutcome, id: "new-outcome" },
    };
    expect(tracker.observe([next])).toEqual([next]);
  });

  it("waits for completion and ignores successful and canceled backups", () => {
    const tracker = createBackupResultTracker();
    tracker.start([source()]);
    expect(tracker.observe([source({ status: "RUNNING" })])).toEqual([]);
    const canceled = {
      ...source({ status: "FAILED" }),
      lastSnapshotTask: source({ status: "CANCELED" }).lastSnapshotTask,
    };
    expect(getBackupIssue(canceled)?.kind).toBe("failed");
    expect(tracker.observe([canceled])).toEqual([]);
    expect(tracker.observe([source({ status: "FAILED" })])).toEqual([]);
    tracker.start([source({ id: "1" })]);
    expect(tracker.observe([source({ id: "2", status: "SUCCESS" })])).toEqual(
      [],
    );
  });

  it("tracks every requested source, ignores unrelated failures, and can clear an HTTP failure", () => {
    const tracker = createBackupResultTracker();
    tracker.start([source(undefined, "a"), source(undefined, "b")]);
    expect(tracker.observe([source({ status: "FAILED" }, "c")])).toEqual([]);
    expect(tracker.observe([source({ status: "SUCCESS" }, "a")])).toEqual([]);
    const failed = source({ status: "FAILED" }, "b");
    expect(tracker.observe([failed])).toEqual([failed]);
    tracker.start([source()]);
    tracker.clear();
    expect(tracker.observe([source({ status: "FAILED" })])).toEqual([]);
  });

  it("waits for idle so completed tasks cannot report stale snapshot errors", () => {
    const tracker = createBackupResultTracker();
    tracker.start([source()]);
    const failed = source({ status: "FAILED" });
    const finishing = { ...failed, status: "UPLOADING" as const };
    expect(getBackupIssue(finishing)?.kind).toBe("failed");
    expect(tracker.observe([finishing])).toEqual([]);
    expect(tracker.observe([failed])).toEqual([failed]);
  });
});
