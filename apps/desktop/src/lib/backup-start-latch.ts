export function createBackupStartLatch() {
  let awaitingStatus = false;
  let startingSnapshotId: string | undefined;

  return {
    tryStart(latestSnapshotId?: string) {
      if (awaitingStatus) return false;
      awaitingStatus = true;
      startingSnapshotId = latestSnapshotId;
      return true;
    },
    observe(isRunning: boolean, latestSnapshotId?: string) {
      if (
        !awaitingStatus ||
        (!isRunning && latestSnapshotId === startingSnapshotId)
      )
        return false;

      awaitingStatus = false;
      return true;
    },
    release() {
      awaitingStatus = false;
    },
  };
}
