import type { CoreSourceItem } from "@desktop/hooks/queries/core/use-source-list";
import type { CoreTask } from "@desktop/hooks/queries/core/use-task";
import {
  createBackupResultTracker,
  getBackupIssue,
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
