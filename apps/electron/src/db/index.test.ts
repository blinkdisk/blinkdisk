const mocks = vi.hoisted(() => {
  class MockCollection {
    name: string;
    items: { id: string }[];
    listeners = new Map<string, () => void>();
    isReady = vi.fn(async () => undefined);
    on = vi.fn((event: string, listener: () => void) => {
      this.listeners.set(event, listener);
    });
    find = vi.fn(() => ({ fetch: () => this.items }));

    constructor(options: { name: string }) {
      this.name = options.name;
      this.items = options.name === "vault" ? [...initialVaults] : [];
    }
  }

  const initialVaults: { id: string }[] = [];
  const syncCollections = new Map<string, MockCollection>();

  return {
    MockCollection,
    initialVaults,
    syncCollections,
    addCollection: vi.fn(
      (collection: MockCollection, options: { name: string }) => {
        syncCollections.set(options.name, collection);
      },
    ),
    sync: vi.fn(async (name: string) => {
      const collection = syncCollections.get(name);
      if (collection?.name !== "vault") return;
      collection.items.push({ id: "synced-vault" });
      collection.listeners.get("added")?.();
    }),
    initVaults: vi.fn(async (): Promise<void> => undefined),
    getAccountCache: vi.fn(() => []),
    getLastSync: vi.fn((): string | null => null),
    addBridgeCollection: vi.fn(),
  };
});

vi.mock("node:fs", () => ({ existsSync: () => true, mkdirSync: vi.fn() }));
vi.mock("@blinkdisk/signaldb-electron/main", () => ({
  setupSignalDBMain: () => ({ addCollection: mocks.addBridgeCollection }),
}));
vi.mock("@electron/cache", () => ({ getAccountCache: mocks.getAccountCache }));
vi.mock("@electron/db/schema", () => ({
  SchemaCollection: mocks.MockCollection,
}));
vi.mock("@electron/db/sync", () => ({
  getLastSync: mocks.getLastSync,
  syncManager: { addCollection: mocks.addCollection, sync: mocks.sync },
}));
vi.mock("@electron/log", () => ({ log: { info: vi.fn(), error: vi.fn() } }));
vi.mock("@electron/path", () => ({
  globalAccountDirectory: () => "/accounts",
}));
vi.mock("@electron/vault/manage", () => ({ initVaults: mocks.initVaults }));
vi.mock("@signaldb/fs", () => ({ default: vi.fn() }));
vi.mock("electron", () => ({ ipcMain: {} }));

let collections: typeof import("@electron/db").collections;
let initAccountCollections: typeof import("@electron/db").initAccountCollections;

function deferred() {
  let resolve!: () => void;
  const promise = new Promise<void>((res) => {
    resolve = res;
  });
  return { promise, resolve };
}

describe("account collection initialization", () => {
  beforeEach(async () => {
    vi.resetModules();
    vi.clearAllMocks();
    mocks.initialVaults.length = 0;
    mocks.syncCollections.clear();
    mocks.getLastSync.mockReturnValue(null);
    mocks.initVaults.mockResolvedValue(undefined);
    mocks.sync.mockImplementation(async (name: string) => {
      const collection = mocks.syncCollections.get(name);
      if (collection?.name !== "vault") return;
      collection.items.push({ id: "synced-vault" });
      collection.listeners.get("added")?.();
    });
    ({ collections, initAccountCollections } = await import("@electron/db"));
  });

  it("makes first-login vaults available to initialization during sync events", async () => {
    const initializedVaults: string[][] = [];
    mocks.initVaults.mockImplementation(async () => {
      initializedVaults.push(
        collections.acct_1?.vault
          .find()
          .fetch()
          .map((vault) => vault.id) ?? [],
      );
    });

    await initAccountCollections("acct_1");

    expect(initializedVaults).toEqual([["synced-vault"], ["synced-vault"]]);
  });

  it("initializes cached vaults without requiring a collection change", async () => {
    mocks.initialVaults.push({ id: "cached-vault" });
    mocks.getLastSync.mockReturnValue("2026-01-01T00:00:00.000Z");
    const initializedVaults: string[][] = [];
    mocks.initVaults.mockImplementation(async () => {
      initializedVaults.push(
        collections.acct_1?.vault
          .find()
          .fetch()
          .map((vault) => vault.id) ?? [],
      );
    });

    await initAccountCollections("acct_1");

    expect(initializedVaults).toEqual([["cached-vault"]]);
    expect(mocks.sync).not.toHaveBeenCalled();
  });

  it("registers each account only once", async () => {
    await initAccountCollections("local");
    await initAccountCollections("local");

    expect(mocks.addBridgeCollection).toHaveBeenCalledTimes(2);
    expect(mocks.addCollection).not.toHaveBeenCalled();
  });

  it("waits for shared sync and reconciliation when account setup overlaps", async () => {
    const sync = deferred();
    const reconciliation = deferred();
    mocks.sync.mockImplementation(async () => sync.promise);
    mocks.initVaults.mockReturnValue(reconciliation.promise);

    const first = initAccountCollections("acct_1");
    const second = initAccountCollections("acct_1");
    await vi.waitFor(() => expect(mocks.sync).toHaveBeenCalledTimes(2));

    const third = initAccountCollections("acct_1");
    const completed = vi.fn();
    const callers = [first, second, third].map((promise) =>
      promise.then(completed),
    );
    await Promise.resolve();
    expect(completed).not.toHaveBeenCalled();

    sync.resolve();
    await vi.waitFor(() => expect(mocks.initVaults).toHaveBeenCalledOnce());
    expect(completed).not.toHaveBeenCalled();

    reconciliation.resolve();
    await Promise.all(callers);

    expect(completed).toHaveBeenCalledTimes(3);
    expect(mocks.addBridgeCollection).toHaveBeenCalledTimes(2);
    expect(mocks.addCollection).toHaveBeenCalledTimes(2);
    expect(mocks.sync).toHaveBeenCalledTimes(2);
  });

  it("retries a failed initial sync without duplicating registered collections", async () => {
    const error = new Error("Initial vault sync failed");
    mocks.sync.mockRejectedValueOnce(error);

    await expect(initAccountCollections("acct_1")).rejects.toThrow(error);
    const registered = collections.acct_1;
    mocks.getLastSync.mockReturnValue("2026-01-01T00:00:00.000Z");

    await expect(initAccountCollections("acct_1")).resolves.toBeUndefined();

    expect(collections.acct_1).toBe(registered);
    expect(mocks.addBridgeCollection).toHaveBeenCalledTimes(2);
    expect(mocks.addCollection).toHaveBeenCalledTimes(2);
    expect(mocks.sync.mock.calls).toEqual([
      ["acct_1/vault"],
      ["acct_1/config"],
      ["acct_1/vault"],
      ["acct_1/config"],
    ]);
    expect(mocks.initVaults).toHaveBeenCalledTimes(2);
  });

  it("waits for both syncs to settle before allowing a failed setup to retry", async () => {
    const sync = deferred();
    const error = new Error("Initial vault sync failed");
    mocks.sync.mockRejectedValueOnce(error).mockReturnValueOnce(sync.promise);
    const first = initAccountCollections("acct_1");
    const expectation = expect(first).rejects.toThrow(error);
    await vi.waitFor(() => expect(mocks.sync).toHaveBeenCalledTimes(2));

    const second = initAccountCollections("acct_1");
    const secondExpectation = expect(second).rejects.toThrow(error);
    expect(mocks.sync).toHaveBeenCalledTimes(2);

    sync.resolve();
    await Promise.all([expectation, secondExpectation]);
    await expect(initAccountCollections("acct_1")).resolves.toBeUndefined();
    expect(mocks.sync).toHaveBeenCalledTimes(4);
  });
});
