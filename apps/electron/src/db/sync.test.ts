const mocks = vi.hoisted(() => {
  const syncInstances: MockSyncManager[] = [];

  class MockSyncManager {
    options: Record<string, unknown>;
    sync = vi.fn(async (name: string) => name);
    addCollection = vi.fn();

    constructor(options: Record<string, unknown>) {
      this.options = options;
      syncInstances.push(this);
    }
  }

  return {
    syncInstances,
    MockSyncManager,
    existsSync: vi.fn((_path: unknown): boolean => false),
    mkdirSync: vi.fn((_path: unknown, _options?: unknown) => undefined),
    readFileSync: vi.fn((_path: unknown, _encoding?: unknown): unknown => ""),
    writeFileSync: vi.fn((_path: unknown, _data: unknown) => undefined),
    createFilesystemAdapter: vi.fn((path: string) => ({ path })),
    globalAccountDirectory: vi.fn(() => "/accounts"),
    logWarn: vi.fn((_message: unknown) => undefined),
    trpc: {
      vault: {
        pull: { query: vi.fn() },
        push: { mutate: vi.fn() },
      },
      config: {
        pull: { query: vi.fn() },
        push: { mutate: vi.fn() },
      },
    },
  };
});

vi.mock("node:fs", () => ({
  existsSync: (path: unknown) => mocks.existsSync(path),
  mkdirSync: (path: unknown, options?: unknown) =>
    mocks.mkdirSync(path, options),
  readFileSync: (path: unknown, encoding?: unknown) =>
    mocks.readFileSync(path, encoding),
  writeFileSync: (path: unknown, data: unknown) =>
    mocks.writeFileSync(path, data),
}));

vi.mock("@electron/path", () => ({
  globalAccountDirectory: () => mocks.globalAccountDirectory(),
}));

vi.mock("@electron/log", () => ({
  log: {
    warn: (message: unknown) => mocks.logWarn(message),
  },
}));

vi.mock("@electron/trpc", () => ({
  trpc: mocks.trpc,
}));

vi.mock("@signaldb/fs", () => ({
  default: (path: string) => mocks.createFilesystemAdapter(path),
}));

vi.mock("@signaldb/sync", () => ({
  SyncManager: mocks.MockSyncManager,
}));

import { getLastSync, syncAccount, syncManager } from "@electron/db/sync";

function getSyncOptions() {
  const instance = mocks.syncInstances[0];
  if (!instance) throw new Error("SyncManager was not created");
  return instance.options as {
    persistenceAdapter: (name: string) => unknown;
    pull: (options: {
      name: string;
      accountId: string;
      type: "VAULT" | "CONFIG";
    }) => Promise<{ items: { id: string }[] }>;
    push: (
      options: { name: string; accountId: string; type: "VAULT" | "CONFIG" },
      payload: { changes: { added: unknown[]; modified: unknown[] } },
    ) => Promise<void>;
  };
}

describe("electron sync manager", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.useRealTimers();
    mocks.existsSync.mockReturnValue(true);
  });

  it("pulls vault and config records with the account context", async () => {
    const options = getSyncOptions();
    mocks.trpc.vault.pull.query.mockResolvedValueOnce({
      items: [{ id: "vlt_1" }],
    });
    mocks.trpc.config.pull.query.mockResolvedValueOnce({
      items: [{ id: "cfg_1" }],
    });

    await expect(
      options.pull({
        name: "acct_1/vault",
        accountId: "acct_1",
        type: "VAULT",
      }),
    ).resolves.toEqual({ items: [{ id: "vlt_1" }] });
    await expect(
      options.pull({
        name: "acct_1/config",
        accountId: "acct_1",
        type: "CONFIG",
      }),
    ).resolves.toEqual({ items: [{ id: "cfg_1" }] });

    expect(mocks.trpc.vault.pull.query).toHaveBeenCalledWith(undefined, {
      context: { accountId: "acct_1" },
    });
    expect(mocks.trpc.config.pull.query).toHaveBeenCalledWith(undefined, {
      context: { accountId: "acct_1" },
    });
  });

  it("rejects pulls that do not return an item array", async () => {
    const options = getSyncOptions();
    mocks.trpc.vault.pull.query.mockResolvedValueOnce({ items: null });

    await expect(
      options.pull({
        name: "acct_1/vault",
        accountId: "acct_1",
        type: "VAULT",
      }),
    ).rejects.toThrow("Failed to pull items");
  });

  it("retries config pushes once when remote vaults are not synced yet", async () => {
    vi.useFakeTimers();
    const options = getSyncOptions();
    mocks.trpc.config.push.mutate
      .mockRejectedValueOnce({ data: { code: "VAULT_NOT_FOUND" } })
      .mockResolvedValueOnce(undefined);

    const promise = options.push(
      { name: "acct_1/config", accountId: "acct_1", type: "CONFIG" },
      { changes: { added: [{ id: "cfg_1" }], modified: [] } },
    );

    await vi.runAllTimersAsync();
    await expect(promise).resolves.toBeUndefined();

    expect(mocks.logWarn).toHaveBeenCalledWith(
      "Config push failed due to missing vaults, retrying in 10 seconds...",
    );
    expect(mocks.trpc.config.push.mutate).toHaveBeenCalledTimes(2);
  });

  it("syncs vault and config collections for an account", async () => {
    await expect(syncAccount("acct_1")).resolves.toEqual([
      "acct_1/vault",
      "acct_1/config",
    ]);

    expect(syncManager.sync).toHaveBeenCalledWith("acct_1/vault");
    expect(syncManager.sync).toHaveBeenCalledWith("acct_1/config");
  });

  it("returns the latest matching sync operation time", () => {
    mocks.existsSync.mockReturnValueOnce(true);
    mocks.readFileSync.mockReturnValueOnce(
      JSON.stringify([
        { collectionName: "acct_1/vault", start: "2026-01-01T00:00:00.000Z" },
        { collectionName: "acct_1/config", start: "2026-01-03T00:00:00.000Z" },
        { collectionName: "acct_1/vault", start: "2026-01-02T00:00:00.000Z" },
      ]),
    );

    expect(getLastSync("acct_1/vault")).toBe("2026-01-02T00:00:00.000Z");
  });

  it("creates a persistence file when the sync operation log is missing", () => {
    mocks.existsSync.mockReturnValueOnce(false).mockReturnValueOnce(false);
    const options = getSyncOptions();

    expect(options.persistenceAdapter("sync-sync-acct_1/vault")).toEqual({
      path: "/accounts/sync-acct_1/vault.json",
    });
    expect(mocks.mkdirSync).toHaveBeenCalledWith("/accounts", {
      recursive: true,
    });
    expect(mocks.writeFileSync).toHaveBeenCalledWith(
      "/accounts/sync-acct_1/vault.json",
      "[]",
    );
  });
});
