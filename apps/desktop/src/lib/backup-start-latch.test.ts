import {
  createBackupStartCoordinator,
  createBackupStartLatch,
  getBackupStartCoordinator,
} from "@desktop/lib/backup-start-latch";
import { afterEach, describe, expect, it, vi } from "vitest";

type SourceStatus = "IDLE" | "PENDING" | "UPLOADING" | "REMOTE";

function source(id: string, status: SourceStatus, snapshotId?: string) {
  return {
    id,
    status,
    lastSnapshot: snapshotId ? { id: snapshotId } : undefined,
  };
}

afterEach(() => vi.useRealTimers());

describe("backup start latch", () => {
  it("waits for every source in a batch before allowing another start", () => {
    const latch = createBackupStartLatch();
    const initial = [
      source("a", "IDLE", "old-a"),
      source("b", "IDLE", "old-b"),
    ];

    expect(latch.tryStart(initial)).toBe(true);
    expect(latch.observe([source("a", "PENDING", "old-a")])).toBe(false);
    expect(latch.settle()).toBe(false);
    expect(latch.tryStart(initial)).toBe(false);

    expect(latch.observe([source("b", "IDLE", "new-b")])).toBe(true);
  });

  it("unlocks when a fast backup completes between status polls", () => {
    const latch = createBackupStartLatch();

    latch.tryStart([source("a", "IDLE", "old")]);
    latch.settle();

    expect(latch.observe([source("a", "IDLE", "new")])).toBe(true);
  });

  it("ignores missing source data and permits retry after failure", () => {
    const latch = createBackupStartLatch();

    latch.tryStart([source("a", "IDLE", "old")]);
    latch.settle();
    expect(latch.observe(undefined)).toBe(false);
    expect(latch.tryStart([source("a", "IDLE", "old")])).toBe(false);

    latch.release();

    expect(latch.tryStart([source("a", "IDLE", "old")])).toBe(true);
  });
});

describe("backup start coordinator", () => {
  it("shares one in-flight guard across controls in the same vault", () => {
    const first = getBackupStartCoordinator("shared-test-vault");
    const second = getBackupStartCoordinator("shared-test-vault");
    const initial = [source("a", "IDLE")];

    expect(first.begin(initial)).toBe(true);
    expect(second.store.state).toBe(true);
    expect(second.begin(initial)).toBe(false);

    first.release();
    expect(second.store.state).toBe(false);
  });

  it("releases an unconfirmed start after the watchdog expires", () => {
    vi.useFakeTimers();
    const coordinator = createBackupStartCoordinator();

    coordinator.begin([source("a", "REMOTE")]);
    coordinator.settle();
    expect(coordinator.store.state).toBe(true);

    vi.advanceTimersByTime(30_000);

    expect(coordinator.store.state).toBe(false);
    expect(coordinator.begin([source("a", "REMOTE")])).toBe(true);
    coordinator.release();
  });
});
