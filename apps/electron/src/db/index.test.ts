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
    initVaults: vi.fn(async () => undefined),
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

import { collections, initAccountCollections } from "@electron/db";

describe("account collection initialization", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.initialVaults.length = 0;
    mocks.syncCollections.clear();
    mocks.getLastSync.mockReturnValue(null);
    mocks.initVaults.mockResolvedValue(undefined);
    for (const accountId of Object.keys(collections))
      delete collections[accountId];
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

    expect(initializedVaults).toContainEqual(["synced-vault"]);
    expect(initializedVaults.every((ids) => ids.includes("synced-vault"))).toBe(
      true,
    );
  });

  it("initializes cached vaults without requiring a collection change", async () => {
    mocks.initialVaults.push({ id: "cached-vault" });
    mocks.getLastSync.mockReturnValue("2026-01-01T00:00:00.000Z");

    await initAccountCollections("acct_1");

    expect(mocks.initVaults).toHaveBeenCalled();
    expect(mocks.sync).not.toHaveBeenCalled();
  });

  it("registers each account only once", async () => {
    await initAccountCollections("local");
    await initAccountCollections("local");

    expect(mocks.addBridgeCollection).toHaveBeenCalledTimes(2);
    expect(mocks.addCollection).not.toHaveBeenCalled();
  });
});
