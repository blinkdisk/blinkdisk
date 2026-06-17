import { consumeSpace, getFileCache } from "@cloud/utils/space";

function createStorage(seed?: Record<string, unknown>) {
  const values = new Map(Object.entries(seed || {}));

  return {
    values,
    get: vi.fn(async (key: string) => values.get(key)),
    put: vi.fn(async (key: string, value: unknown) => {
      values.set(key, value);
    }),
    delete: vi.fn(async (key: string) => {
      values.delete(key);
    }),
  };
}

function createSpaceNamespace(consume = vi.fn()) {
  return {
    consume,
    namespace: {
      getByName: vi.fn(() => ({ consume })),
    },
  };
}

describe("cloud space utilities", () => {
  it("returns zero-size cache entries for unknown files", async () => {
    const storage = createStorage();

    await expect(
      getFileCache(storage as unknown as DurableObjectStorage, "missing"),
    ).resolves.toEqual({ size: 0 });
  });

  it("consumes only the positive overwrite delta and tracks current bytes", async () => {
    const storage = createStorage({
      spaceId: "spc_1",
      "file:archive.blob": { size: 100 },
      currentBytes: 100,
    });
    const { namespace, consume } = createSpaceNamespace(
      vi.fn(async () => ({ space: { used: 150, capacity: 200 } })),
    );

    const result = await consumeSpace(
      storage as unknown as DurableObjectStorage,
      namespace as never,
      "archive.blob",
      150,
    );

    expect(namespace.getByName).toHaveBeenCalledWith("spc_1");
    expect(consume).toHaveBeenCalledWith(50);
    expect(storage.values.get("file:archive.blob")).toEqual({ size: 150 });
    expect(storage.values.get("currentBytes")).toBe(150);
    expect(result).toEqual({ space: { used: 150, capacity: 200 } });
  });

  it("subtracts overwrite deltas and deletes file cache entries at size zero", async () => {
    const storage = createStorage({
      spaceId: "spc_1",
      "file:archive.blob": { size: 150 },
      currentBytes: 150,
    });
    const { namespace, consume } = createSpaceNamespace(
      vi.fn(async () => ({ space: { used: 0, capacity: 200 } })),
    );

    const result = await consumeSpace(
      storage as unknown as DurableObjectStorage,
      namespace as never,
      "archive.blob",
      0,
    );

    expect(consume).toHaveBeenCalledWith(-150);
    expect(storage.values.has("file:archive.blob")).toBe(false);
    expect(storage.values.get("currentBytes")).toBe(0);
    expect(result).toEqual({ space: { used: 0, capacity: 200 } });
  });

  it("does not update local cache when the space object rejects a delta", async () => {
    const storage = createStorage({
      spaceId: "spc_1",
      "file:archive.blob": { size: 100 },
      currentBytes: 100,
    });
    const { namespace } = createSpaceNamespace(
      vi.fn(async () => ({ error: "STORAGE_FULL" })),
    );

    const result = await consumeSpace(
      storage as unknown as DurableObjectStorage,
      namespace as never,
      "archive.blob",
      250,
    );

    expect(result).toEqual({ error: "STORAGE_FULL" });
    expect(storage.values.get("file:archive.blob")).toEqual({ size: 100 });
    expect(storage.values.get("currentBytes")).toBe(100);
  });

  it("skips remote accounting when file size is unchanged", async () => {
    const storage = createStorage({
      "file:archive.blob": { size: 100 },
      currentBytes: 100,
    });
    const { namespace, consume } = createSpaceNamespace();

    const result = await consumeSpace(
      storage as unknown as DurableObjectStorage,
      namespace as never,
      "archive.blob",
      100,
    );

    expect(result).toEqual({});
    expect(namespace.getByName).not.toHaveBeenCalled();
    expect(consume).not.toHaveBeenCalled();
  });
});
