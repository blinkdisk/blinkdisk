import { createBackupStartLatch } from "@desktop/lib/backup-start-latch";
import { describe, expect, it } from "vitest";

describe("backup start latch", () => {
  it("blocks repeated starts after the request returns until status confirms the backup", () => {
    const latch = createBackupStartLatch();

    expect(latch.tryStart("old-snapshot")).toBe(true);
    expect(latch.observe(false, "old-snapshot")).toBe(false);
    expect(latch.tryStart("old-snapshot")).toBe(false);

    expect(latch.observe(true, "old-snapshot")).toBe(true);
    expect(latch.tryStart("old-snapshot")).toBe(true);
  });

  it("unlocks when a fast backup completes between status polls", () => {
    const latch = createBackupStartLatch();

    latch.tryStart("old-snapshot");

    expect(latch.observe(false, "new-snapshot")).toBe(true);
    expect(latch.tryStart("new-snapshot")).toBe(true);
  });

  it("permits another attempt after a failed request", () => {
    const latch = createBackupStartLatch();

    latch.tryStart();
    latch.release();

    expect(latch.tryStart()).toBe(true);
  });
});
