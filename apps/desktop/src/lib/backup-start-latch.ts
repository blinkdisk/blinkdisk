import type { CoreSourceItem } from "@desktop/hooks/queries/core/use-source-list";
import { Store } from "@tanstack/react-store";

const BACKUP_START_TIMEOUT_MS = 30_000;

type BackupStartSource = Pick<CoreSourceItem, "id" | "status"> & {
  lastSnapshot?: { id: string };
  lastSnapshotTask?: { id: string };
};

export function createBackupStartLatch() {
  let targets: Map<
    string,
    { snapshotId?: string; taskId?: string; confirmed: boolean }
  > | null = null;
  let settled = false;

  const allConfirmed = () =>
    targets !== null &&
    targets.size > 0 &&
    [...targets.values()].every((target) => target.confirmed);

  return {
    tryStart(sources?: BackupStartSource[]) {
      if (targets !== null || !sources?.length) return false;

      targets = new Map(
        sources.map((source) => [
          source.id,
          {
            snapshotId: source.lastSnapshot?.id,
            taskId: source.lastSnapshotTask?.id,
            confirmed: false,
          },
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
          (source.lastSnapshotTask?.id !== undefined &&
            source.lastSnapshotTask.id !== target.taskId) ||
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

export function createBackupStartCoordinator(onRelease?: () => void) {
  const latch = createBackupStartLatch();
  const store = new Store(false);
  let watchdog: ReturnType<typeof setTimeout> | undefined;

  const release = () => {
    if (watchdog !== undefined) clearTimeout(watchdog);
    watchdog = undefined;
    latch.release();
    store.setState(() => false);
    onRelease?.();
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
      if (!store.state) return;
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
  {
    coordinator: ReturnType<typeof createBackupStartCoordinator>;
    subscribers: number;
  }
>();

export function getBackupStartCoordinator(vaultId: string) {
  const evictIfUnused = () => {
    const entry = coordinators.get(vaultId);
    if (entry && !entry.subscribers && !entry.coordinator.store.state)
      coordinators.delete(vaultId);
  };

  const getEntry = () => {
    let entry = coordinators.get(vaultId);
    if (!entry) {
      entry = {
        coordinator: createBackupStartCoordinator(evictIfUnused),
        subscribers: 0,
      };
      coordinators.set(vaultId, entry);
    }
    return entry;
  };

  return {
    get: () => coordinators.get(vaultId)?.coordinator.store.state ?? false,
    subscribe(listener: (value: boolean) => void) {
      const entry = getEntry();
      entry.subscribers++;
      const subscription = entry.coordinator.store.subscribe(listener);

      return {
        unsubscribe() {
          subscription.unsubscribe();
          entry.subscribers--;
          evictIfUnused();
        },
      };
    },
    begin(sources?: BackupStartSource[]) {
      if (!sources?.length) return false;
      return getEntry().coordinator.begin(sources);
    },
    observe(sources?: BackupStartSource[]) {
      coordinators.get(vaultId)?.coordinator.observe(sources);
    },
    settle() {
      coordinators.get(vaultId)?.coordinator.settle();
    },
    release() {
      coordinators.get(vaultId)?.coordinator.release();
    },
  };
}
