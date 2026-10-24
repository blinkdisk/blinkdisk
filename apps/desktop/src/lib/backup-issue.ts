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
  if (!source) return null;

  const outcome = source.lastBackupOutcome;
  const snapshotIsNewer =
    source.lastSnapshot &&
    !source.lastSnapshot.incomplete &&
    outcome &&
    Date.parse(source.lastSnapshot.startTime) > Date.parse(outcome.endTime);

  if (outcome && !snapshotIsNewer) {
    if (outcome.status === "FAILED") {
      return {
        kind: "failed" as const,
        reason: getFailureReason(outcome.errorMessage),
        message: outcome.errorMessage,
      };
    }
    if (outcome.status === "SUCCESS") return null;
    return {
      kind: "partial" as const,
      reason: "partial" as const,
      message: undefined,
    };
  }

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
  const pending = new Map<string, { taskId?: string; outcomeId?: string }>();

  return {
    start(sources: CoreSourceItem[]) {
      pending.clear();
      for (const source of sources) {
        pending.set(source.id, {
          taskId: source.lastSnapshotTask?.id,
          outcomeId: source.lastBackupOutcome?.id,
        });
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
          (task.id === pending.get(source.id)?.taskId &&
            source.lastBackupOutcome?.id ===
              pending.get(source.id)?.outcomeId) ||
          task.status === "RUNNING" ||
          task.status === "CANCELING"
        )
          continue;

        pending.delete(source.id);
        if (task.status !== "CANCELED" && getBackupIssue(source))
          failed.push(source);
      }

      return failed;
    },
  };
}
