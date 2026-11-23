import type { CoreSourceItem } from "@desktop/hooks/queries/core/use-source-list";
import {
  buildSuggestedFolders,
  getBackupView,
  getPathName,
  getPreviousView,
  isOnboardingActive,
  resolveFolders,
  shouldShowOnboarding,
  summarizeBackup,
  summarizeSelection,
} from "@desktop/lib/onboarding";

const freshInstall = {
  record: undefined,
  hasOnlineAccount: false,
  hasLocalVaults: false,
  hasSkippedAuth: false,
};

function source(
  path: string,
  overrides: Partial<CoreSourceItem> = {},
): CoreSourceItem {
  return {
    id: `user@host:${path}`,
    type: "directory",
    source: { host: "host", userName: "user", path },
    status: "IDLE",
    schedule: { runMissed: false },
    currentTask: "",
    currentTaskStatus: "SUCCESS",
    ...overrides,
  };
}

function snapshot(totalSize: number, fileCount: number, errorCount = 0) {
  return {
    lastSnapshot: {
      id: "snapshot",
      folder: { host: "host", userName: "user", path: "/" },
      description: "",
      startTime: "2026-01-01T00:00:00Z",
      endTime: "2026-01-01T00:01:00Z",
      stats: {
        totalSize,
        fileCount,
        errorCount,
        excludedTotalSize: 0,
        cachedFiles: 0,
        nonCachedFiles: fileCount,
        dirCount: 1,
        excludedFileCount: 0,
        excludedDirCount: 0,
        ignoredErrorCount: 0,
      },
    },
  } satisfies Partial<CoreSourceItem>;
}

function uploading(progress: number, bytes: number, files: number) {
  return {
    status: "UPLOADING",
    upload: {
      progress,
      hashedBytes: bytes,
      cachedBytes: 0,
      hashedFiles: files,
      cachedFiles: 0,
      directory: "",
    },
  } satisfies Partial<CoreSourceItem>;
}

describe("shouldShowOnboarding", () => {
  it("starts on a fresh install", () => {
    expect(shouldShowOnboarding(freshInstall)).toBe(true);
  });

  it("never starts for installs that predate onboarding", () => {
    for (const existing of [
      { hasOnlineAccount: true },
      { hasLocalVaults: true },
      { hasSkippedAuth: true },
    ]) {
      expect(shouldShowOnboarding({ ...freshInstall, ...existing })).toBe(
        false,
      );
    }
  });

  it("resumes an unfinished run even after an account or vault exists", () => {
    expect(
      shouldShowOnboarding({
        record: { startedAt: "2026-01-01" },
        hasOnlineAccount: true,
        hasLocalVaults: true,
        hasSkippedAuth: false,
      }),
    ).toBe(true);
  });

  it("stays finished once completed", () => {
    expect(
      shouldShowOnboarding({
        ...freshInstall,
        record: { startedAt: "2026-01-01", completedAt: "2026-01-02" },
      }),
    ).toBe(false);
  });
});

describe("isOnboardingActive", () => {
  it("is only active between start and completion", () => {
    expect(isOnboardingActive(undefined)).toBe(false);
    expect(isOnboardingActive({})).toBe(false);
    expect(isOnboardingActive({ startedAt: "2026-01-01" })).toBe(true);
    expect(
      isOnboardingActive({
        startedAt: "2026-01-01",
        completedAt: "2026-01-02",
      }),
    ).toBe(false);
  });
});

describe("getPreviousView", () => {
  it("returns to the provider form when the password follows own storage", () => {
    expect(getPreviousView("password", "CUSTOM")).toBe("config");
    expect(getPreviousView("password", "CLOUDBLINK")).toBe("storage");
  });

  it("has nothing before the welcome screen", () => {
    expect(getPreviousView("welcome", "CLOUDBLINK")).toBeNull();
  });
});

describe("folders", () => {
  it("names folders after their last path segment on any platform", () => {
    expect(getPathName("/home/sam/Documents")).toBe("Documents");
    expect(getPathName("C:\\Users\\Sam\\Pictures\\")).toBe("Pictures");
    expect(getPathName("/")).toBe("/");
  });

  it("preselects the folders people can't replace", () => {
    const folders = buildSuggestedFolders([
      { kind: "documents", path: "/home/sam/Documents" },
      { kind: "downloads", path: "/home/sam/Downloads" },
    ]);

    expect(folders.map((folder) => folder.selected)).toEqual([true, false]);
    expect(folders[0]?.name).toBe("Documents");
  });

  it("applies the user's choices on top of the presets", () => {
    const suggested = buildSuggestedFolders([
      { kind: "documents", path: "/home/sam/Documents" },
      { kind: "downloads", path: "/home/sam/Downloads" },
    ]);

    const folders = resolveFolders(
      suggested,
      ["/mnt/work", "/home/sam/Downloads"],
      { "/home/sam/Documents": false, "/home/sam/Downloads": true },
    );

    expect(folders.map((folder) => [folder.name, folder.selected])).toEqual([
      ["Documents", false],
      ["Downloads", true],
      ["work", true],
    ]);
  });

  it("only totals selected folders and flags sizes still being measured", () => {
    const folders = [
      { path: "/a", name: "a", selected: true },
      { path: "/b", name: "b", selected: true },
      { path: "/c", name: "c", selected: false },
    ];

    expect(summarizeSelection(folders, { "/a": 100, "/c": 900 })).toEqual({
      count: 2,
      bytes: 100,
      isCalculating: true,
    });
    expect(
      summarizeSelection(folders, { "/a": 100, "/b": 50 }).isCalculating,
    ).toBe(false);
    expect(summarizeSelection(null, {}).count).toBe(0);
  });
});

describe("summarizeBackup", () => {
  it("is starting until the first folder begins uploading", () => {
    expect(summarizeBackup(undefined).phase).toBe("STARTING");
    expect(summarizeBackup([source("/a"), source("/b")])).toMatchObject({
      phase: "STARTING",
      progress: 0,
    });
  });

  it("counts finished and in-flight folders towards progress", () => {
    const summary = summarizeBackup([
      source("/a", snapshot(100, 4)),
      source("/b", uploading(0.5, 40, 2)),
    ]);

    expect(summary.phase).toBe("RUNNING");
    expect(summary.progress).toBe(0.75);
    expect(summary.protectedBytes).toBe(140);
    expect(summary.protectedFiles).toBe(6);
  });

  it("weights progress by folder size when every size is known", () => {
    const summary = summarizeBackup(
      [source("/small", snapshot(10, 1)), source("/big", uploading(0, 0, 0))],
      { "/small": 10, "/big": 990 },
    );

    expect(summary.progress).toBe(0.01);
  });

  it("is done once every folder has a complete backup", () => {
    const summary = summarizeBackup([
      source("/a", snapshot(100, 4)),
      source("/b", snapshot(50, 1)),
    ]);

    expect(summary).toMatchObject({
      phase: "DONE",
      progress: 1,
      protectedBytes: 150,
      protectedFiles: 5,
    });
  });

  it("reports an issue instead of success when a folder had errors", () => {
    expect(
      summarizeBackup([
        source("/a", snapshot(100, 4)),
        source("/b", snapshot(50, 1, 2)),
      ]).phase,
    ).toBe("ISSUE");

    expect(
      summarizeBackup([
        source("/a", {
          lastBackupOutcome: {
            id: "outcome",
            status: "FAILED",
            startTime: "2026-01-01T00:00:00Z",
            endTime: "2026-01-01T00:00:01Z",
          },
        }),
      ]).phase,
    ).toBe("ISSUE");
  });

  it("keeps waiting on queued folders after others finish", () => {
    expect(
      summarizeBackup([
        source("/a", snapshot(100, 4)),
        source("/b", { status: "PENDING" }),
      ]).phase,
    ).toBe("RUNNING");
  });
});

describe("getBackupView", () => {
  const started = {
    vaultStatus: "RUNNING",
    firstBackupStatus: "STARTED",
  } as const;
  const reopened = {
    vaultStatus: "RUNNING",
    firstBackupStatus: "IDLE",
  } as const;

  it("shows setup progress until the first folder reports in", () => {
    expect(
      getBackupView({
        vaultStatus: "STARTING",
        firstBackupStatus: "PENDING",
        sources: undefined,
      }),
    ).toBe("STARTING");
    expect(getBackupView({ ...started, sources: [source("/a")] })).toBe(
      "STARTING",
    );
  });

  it("follows the backup once it is underway", () => {
    expect(
      getBackupView({
        ...started,
        sources: [source("/a", uploading(0.2, 1, 1))],
      }),
    ).toBe("RUNNING");
    expect(
      getBackupView({ ...reopened, sources: [source("/a", snapshot(10, 1))] }),
    ).toBe("DONE");
  });

  it("offers to resume when reopened with nothing running", () => {
    expect(getBackupView({ ...reopened, sources: [source("/a")] })).toBe(
      "PAUSED",
    );
  });

  it("fails loudly instead of waiting forever", () => {
    expect(getBackupView({ ...reopened, sources: [] })).toBe("ERROR");
    expect(
      getBackupView({
        vaultStatus: "FAILED",
        firstBackupStatus: "PENDING",
        sources: undefined,
      }),
    ).toBe("ERROR");
    expect(
      getBackupView({
        vaultStatus: "RUNNING",
        firstBackupStatus: "ERROR",
        sources: [source("/a", snapshot(10, 1))],
      }),
    ).toBe("ERROR");
  });
});
