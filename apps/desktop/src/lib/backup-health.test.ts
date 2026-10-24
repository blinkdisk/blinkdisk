import { summarizeBackupHealth } from "@desktop/lib/backup-health";

const checked = { data: 0, isPending: false, isError: false };

describe("backup health", () => {
  it("waits for every vault's initial status", () => {
    expect(
      summarizeBackupHealth([checked, { isPending: true, isError: false }])
        .isLoading,
    ).toBe(true);
  });

  it("keeps failed requests and disconnected vaults from appearing healthy", () => {
    for (const unavailable of [
      { isPending: false, isError: true },
      { ...checked, isError: true },
      { ...checked, data: null },
    ]) {
      expect(summarizeBackupHealth([checked, unavailable])).toEqual({
        sourcesWithIssues: 0,
        isLoading: false,
        isUnavailable: true,
      });
    }
  });

  it("preserves known issues while other vaults are unavailable", () => {
    expect(
      summarizeBackupHealth([
        { ...checked, data: 2 },
        { ...checked, data: null },
      ]),
    ).toEqual({
      sourcesWithIssues: 2,
      isLoading: false,
      isUnavailable: true,
    });
  });

  it("recovers when status checks succeed", () => {
    expect(summarizeBackupHealth([checked])).toEqual({
      sourcesWithIssues: 0,
      isLoading: false,
      isUnavailable: false,
    });
    expect(summarizeBackupHealth([]).isUnavailable).toBe(false);
  });
});
