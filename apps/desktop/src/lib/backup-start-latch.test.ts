import {
  createBackupStartCoordinator,
  createBackupStartLatch,
  getBackupStartCoordinator,
} from "@desktop/lib/backup-start-latch";
import { Store } from "@tanstack/react-store";
import { afterEach, describe, expect, it, vi } from "vitest";

type SourceStatus = "IDLE" | "PENDING" | "UPLOADING" | "REMOTE";

function source(id: string, status: SourceStatus, snapshotId?: string) {
  return {
    id,
    status,
    lastSnapshot: snapshotId ? { id: snapshotId } : undefined,
  };
}

afterEach(() => {
  vi.restoreAllMocks();
  vi.useRealTimers();
});

describe("backup start latch", () => {
  it("rejects missing and empty source lists without blocking a later start", () => {
    const latch = createBackupStartLatch();

    expect(latch.tryStart()).toBe(false);
    expect(latch.tryStart([])).toBe(false);
    expect(latch.tryStart([source("a", "IDLE")])).toBe(true);
  });

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

  it("unlocks when a backup fails before creating a snapshot between polls", () => {
    const latch = createBackupStartLatch();
    latch.tryStart([{ ...source("a", "IDLE"), lastSnapshotTask: { id: "1" } }]);
    latch.settle();
    expect(
      latch.observe([
        { ...source("a", "IDLE"), lastSnapshotTask: { id: "2" } },
      ]),
    ).toBe(true);
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
    const listener = vi.fn();
    const subscription = second.subscribe(listener);

    expect(first.begin(initial)).toBe(true);
    expect(second.get()).toBe(true);
    expect(listener).toHaveBeenLastCalledWith(true);
    expect(second.begin(initial)).toBe(false);

    first.release();
    expect(second.get()).toBe(false);
    subscription.unsubscribe();
  });

  it("rejects unobservable starts without leaving the vault busy", () => {
    vi.useFakeTimers();
    const coordinator = getBackupStartCoordinator("unobserved-test-vault");

    expect(coordinator.get()).toBe(false);
    expect(coordinator.begin()).toBe(false);
    expect(coordinator.begin([])).toBe(false);
    coordinator.observe();
    coordinator.settle();

    expect(coordinator.get()).toBe(false);
    expect(vi.getTimerCount()).toBe(0);
    expect(coordinator.begin([source("a", "IDLE")])).toBe(true);
    coordinator.release();
  });

  it("evicts idle stores only after their last subscriber leaves", () => {
    const subscribe = vi.spyOn(Store.prototype, "subscribe");
    const first = getBackupStartCoordinator("idle-test-vault");
    const second = getBackupStartCoordinator("idle-test-vault");
    const firstSubscription = first.subscribe(vi.fn());
    const secondSubscription = second.subscribe(vi.fn());
    const originalStore = subscribe.mock.contexts[0];

    firstSubscription.unsubscribe();
    const thirdSubscription = first.subscribe(vi.fn());
    expect(subscribe.mock.contexts[2]).toBe(originalStore);
    secondSubscription.unsubscribe();
    thirdSubscription.unsubscribe();

    const remounted = second.subscribe(vi.fn());
    expect(subscribe.mock.contexts[3]).not.toBe(originalStore);
    remounted.unsubscribe();
  });

  it("keeps an unmounted in-flight guard until its watchdog releases it", () => {
    vi.useFakeTimers();
    const subscribe = vi.spyOn(Store.prototype, "subscribe");
    const coordinator = getBackupStartCoordinator("unmounted-test-vault");
    const subscription = coordinator.subscribe(vi.fn());
    const originalStore = subscribe.mock.contexts[0];
    const initial = [source("a", "IDLE")];

    coordinator.begin(initial);
    subscription.unsubscribe();
    expect(coordinator.begin(initial)).toBe(false);
    expect(vi.getTimerCount()).toBe(0);

    coordinator.settle();
    const remounted = coordinator.subscribe(vi.fn());
    expect(subscribe.mock.contexts[1]).toBe(originalStore);
    expect(coordinator.get()).toBe(true);
    remounted.unsubscribe();

    vi.advanceTimersByTime(30_000);

    expect(coordinator.get()).toBe(false);
    expect(vi.getTimerCount()).toBe(0);
    const afterTimeout = coordinator.subscribe(vi.fn());
    expect(subscribe.mock.contexts[2]).not.toBe(originalStore);
    afterTimeout.unsubscribe();
  });

  it("evicts an unmounted guard after an error or confirmed progress", () => {
    vi.useFakeTimers();
    const subscribe = vi.spyOn(Store.prototype, "subscribe");
    const coordinator = getBackupStartCoordinator("released-test-vault");
    const initial = [source("a", "IDLE")];

    for (const confirm of [false, true]) {
      const subscription = coordinator.subscribe(vi.fn());
      const originalStore = subscribe.mock.contexts.at(-1);
      coordinator.begin(initial);
      subscription.unsubscribe();

      if (confirm) {
        coordinator.settle();
        coordinator.observe([source("a", "PENDING")]);
      } else {
        coordinator.release();
      }

      expect(coordinator.get()).toBe(false);
      expect(vi.getTimerCount()).toBe(0);
      const remounted = coordinator.subscribe(vi.fn());
      expect(subscribe.mock.contexts.at(-1)).not.toBe(originalStore);
      remounted.unsubscribe();
    }
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
