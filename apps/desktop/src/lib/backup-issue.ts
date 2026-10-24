import type { CoreSourceItem } from "@desktop/hooks/queries/core/use-source-list";

export type BackupIssueReason = "missing" | "permission" | "failed" | "partial";

const missingPattern =
  /no such file or directory|cannot find the (path|file)|does not exist|not found/i;
const permissionPattern =
  /permission denied|access is denied|operation not permitted/i;

function getFailureReason(message?: string): BackupIssueReason {
  if (message && missingPattern.test(message)) return "missing";
  if (message && permissionPattern.test(message)) return "permission";
  return "failed";
}

export function getBackupIssue(source?: CoreSourceItem) {
  if (!source || source.status === "PENDING" || source.status === "UPLOADING")
    return null;

  const task = source.lastSnapshotTask;
  if (task?.status === "FAILED") {
    return {
      kind: "failed" as const,
      reason: getFailureReason(task.errorMessage),
      message: task.errorMessage,
    };
  }

  if (task && task.status !== "SUCCESS") return null;

  if (
    (source.lastSnapshot?.stats.errorCount || 0) > 0 ||
    (source.lastSnapshot?.rootEntry?.summ?.numFailed || 0) > 0
  ) {
    return {
      kind: "partial" as const,
      reason: "partial" as const,
      message: undefined,
    };
  }

  return null;
}

export function createBackupResultTracker() {
  const pending = new Map<string, string | undefined>();

  return {
    start(sources: CoreSourceItem[]) {
      pending.clear();
      for (const source of sources) {
        pending.set(source.id, source.lastSnapshotTask?.id);
      }
    },
    clear() {
      pending.clear();
    },
    observe(sources?: CoreSourceItem[] | null) {
      const failed: CoreSourceItem[] = [];

      for (const source of sources || []) {
        const task = source.lastSnapshotTask;
        if (
          !pending.has(source.id) ||
          source.status === "PENDING" ||
          source.status === "UPLOADING" ||
          !task ||
          task.id === pending.get(source.id) ||
          task.status === "RUNNING" ||
          task.status === "CANCELING"
        )
          continue;

        pending.delete(source.id);
        if (getBackupIssue(source)) failed.push(source);
      }

      return failed;
    },
  };
}
