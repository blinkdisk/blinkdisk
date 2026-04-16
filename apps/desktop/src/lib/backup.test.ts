import { formatBackupDate, getBackupDisplayName } from "@desktop/lib/backup";

describe("getBackupDisplayName", () => {
  it("returns description when present", () => {
    const backup = {
      description: "Weekly backup",
      startTime: "2024-01-15T10:30:00Z",
    };
    expect(getBackupDisplayName(backup)).toBe("Weekly backup");
  });

  it("falls back to formatted date when description is empty string", () => {
    const backup = { description: "", startTime: "2024-01-15T10:30:00Z" };
    const result = getBackupDisplayName(backup);
    expect(result).not.toBe("");
    expect(result).toBe(formatBackupDate(backup));
  });
});

describe("formatBackupDate", () => {
  it("returns a non-empty string for valid ISO dates", () => {
    expect(formatBackupDate({ startTime: "2024-01-15T10:30:00Z" })).toBeTruthy();
    expect(typeof formatBackupDate({ startTime: "2024-01-15T10:30:00Z" })).toBe(
      "string",
    );
  });

  it("handles various date formats", () => {
    const dates = [
      "2024-01-01T00:00:00Z",
      "2023-12-31T23:59:59Z",
      "2024-06-15T12:00:00+05:00",
    ];

    for (const startTime of dates) {
      const result = formatBackupDate({ startTime });
      expect(result.length).toBeGreaterThan(0);
    }
  });
});
