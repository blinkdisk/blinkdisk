import type { CoreSourceItem } from "@desktop/hooks/queries/core/use-source-list";
import { Store } from "@tanstack/react-store";

const BACKUP_START_TIMEOUT_MS = 30_000;

type BackupStartSource = Pick<CoreSourceItem, "id" | "status"> & {
  lastSnapshot?: { id: string };
};

export function createBackupStartLatch() {
  let targets: Map<string, { snapshotId?: string; confirmed: boolean }> | null =
    null;
  let settled = false;

  const allConfirmed = () =>
    targets !== null &&
    targets.size > 0 &&
    [...targets.values()].every((target) => target.confirmed);

  return {
    tryStart(sources?: BackupStartSource[]) {
      if (targets !== null) return false;

      targets = new Map(
        sources?.map((source) => [
          source.id,
          { snapshotId: source.lastSnapshot?.id, confirmed: false },
        ]),
      );
      settled = false;
      return true;
    },
    observe(sources?: BackupStartSource[]) {
      if (targets === null || !sources) return false;

      for (const source of sources) {
        const target = targets.get(source.id);
        if (!target) continue;

        if (
          source.status === "PENDING" ||
          source.status === "UPLOADING" ||
          (source.lastSnapshot?.id !== undefined &&
            source.lastSnapshot.id !== target.snapshotId)
        ) {
          target.confirmed = true;
        }
      }

      return settled && allConfirmed();
    },
    settle() {
      if (targets === null) return false;
      settled = true;
      return allConfirmed();
    },
    release() {
      targets = null;
      settled = false;
    },
  };
}

export function createBackupStartCoordinator() {
  const latch = createBackupStartLatch();
  const store = new Store(false);
  let watchdog: ReturnType<typeof setTimeout> | undefined;

  const release = () => {
    if (watchdog !== undefined) clearTimeout(watchdog);
    watchdog = undefined;
    latch.release();
    store.setState(() => false);
  };

  return {
    store,
    begin(sources?: BackupStartSource[]) {
      if (!latch.tryStart(sources)) return false;
      store.setState(() => true);
      return true;
    },
    observe(sources?: BackupStartSource[]) {
      if (latch.observe(sources)) release();
    },
    settle() {
      if (latch.settle()) {
        release();
      } else {
        watchdog = setTimeout(release, BACKUP_START_TIMEOUT_MS);
      }
    },
    release,
  };
}

const coordinators = new Map<
  string,
  ReturnType<typeof createBackupStartCoordinator>
>();

export function getBackupStartCoordinator(vaultId: string) {
  let coordinator = coordinators.get(vaultId);
  if (!coordinator) {
    coordinator = createBackupStartCoordinator();
    coordinators.set(vaultId, coordinator);
  }
  return coordinator;
}
