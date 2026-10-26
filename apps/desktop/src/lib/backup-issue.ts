import type { CoreSourceItem } from "@desktop/hooks/queries/core/use-source-list";

export type BackupIssueReason = "missing" | "permission" | "failed" | "partial";

const missingPattern =
  /no such file or directory|cannot find the (path|file)|does not exist/i;
const permissionPattern =
  /permission denied|access(?: is)? denied|operation not permitted/i;

function getFailureReason(message?: string): BackupIssueReason {
  if (!message?.includes("unable to create local filesystem:")) return "failed";
  if (missingPattern.test(message)) return "missing";
  if (permissionPattern.test(message)) return "permission";
  return "failed";
}

function getCurrentBackupOutcome(source: CoreSourceItem) {
  const outcome = source.lastBackupOutcome;
  const snapshotIsNewer =
    source.lastSnapshot &&
    !source.lastSnapshot.incomplete &&
    outcome &&
    Date.parse(source.lastSnapshot.startTime) > Date.parse(outcome.endTime);

  return snapshotIsNewer ? undefined : outcome;
}

export function getBackupIssue(source?: CoreSourceItem) {
  if (!source) return null;

  const outcome = getCurrentBackupOutcome(source);
  if (outcome) {
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

export function getBackupIssueDetails(source: CoreSourceItem) {
  const issue = getBackupIssue(source);
  if (!issue) return null;

  const outcome = getCurrentBackupOutcome(source);
  const latestSnapshot = source.lastSnapshot;
  const snapshot =
    latestSnapshot &&
    !latestSnapshot.incomplete &&
    (!outcome ||
      (outcome.status === "PARTIAL" &&
        Date.parse(latestSnapshot.startTime) >= Date.parse(outcome.startTime) &&
        Date.parse(latestSnapshot.endTime) <= Date.parse(outcome.endTime)))
      ? latestSnapshot
      : undefined;
  const summary = snapshot?.rootEntry?.summ;
  const entries = summary?.errors || [];
  const ignoredErrorCount = summary?.numIgnoredErrors || 0;
  const errorCount = Math.max(
    outcome?.errorCount || 0,
    snapshot?.stats.errorCount || 0,
    summary?.numFailed || 0,
  );
  const totalCount = Math.max(errorCount + ignoredErrorCount, entries.length);
  const startTime = outcome?.startTime || latestSnapshot?.startTime;
  const endTime = outcome?.endTime || latestSnapshot?.endTime;
  const task = source.lastSnapshotTask;
  const taskMatches =
    task &&
    (task.status === "FAILED" || task.status === "SUCCESS") &&
    task.endTime &&
    startTime &&
    endTime &&
    (outcome
      ? task.startTime === outcome.startTime && task.endTime === outcome.endTime
      : Date.parse(task.startTime) <= Date.parse(startTime) &&
        Date.parse(task.endTime) >= Date.parse(endTime));

  return {
    entries,
    totalCount,
    ignoredErrorCount,
    startTime,
    taskId: taskMatches ? task.id : undefined,
    isTruncated: totalCount > entries.length,
  };
}

export function getEntryErrorReason(error: string) {
  const reason = error.split(": ").at(-1)?.trim() || error;
  return reason.charAt(0).toUpperCase() + reason.slice(1);
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
