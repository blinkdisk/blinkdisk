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
      message: "lstat: source missing",
    });
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
      }),
    ).toBeNull();
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

  it("waits for completion and ignores successful and canceled backups", () => {
    const tracker = createBackupResultTracker();
    tracker.start([source()]);
    expect(tracker.observe([source({ status: "RUNNING" })])).toEqual([]);
    expect(tracker.observe([source({ status: "CANCELED" })])).toEqual([]);
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
    expect(getBackupIssue(finishing)).toBeNull();
    expect(tracker.observe([finishing])).toEqual([]);
    expect(tracker.observe([failed])).toEqual([failed]);
  });
});
