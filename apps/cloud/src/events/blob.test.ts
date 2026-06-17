import {
  DeleteObjectCommand,
  GetObjectCommand,
  PutObjectCommand,
} from "@aws-sdk/client-s3";
import { deleteBlob } from "@cloud/events/delete";
import { getBlob } from "@cloud/events/get";
import { putBlob } from "@cloud/events/put";

const mocks = vi.hoisted(() => ({
  getSignedUrl: vi.fn(
    async (_client: unknown, _command: unknown, _options: unknown) =>
      "https://signed.example/blob",
  ),
  logsnag: vi.fn(),
}));

vi.mock("@aws-sdk/s3-request-presigner", () => ({
  getSignedUrl: (client: unknown, command: unknown, options: unknown) =>
    mocks.getSignedUrl(client, command, options),
}));

vi.mock("@blinkdisk/utils/logsnag", () => ({
  logsnag: (...args: unknown[]) => mocks.logsnag(...args),
}));

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

function createVault() {
  return {
    id: "vlt_1",
    bucket: "bucket",
    s3: {
      send: vi.fn(async (_command: unknown) => undefined),
    },
  };
}

describe("cloud blob events", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns validation errors before touching storage for invalid put payloads", async () => {
    const vault = createVault();
    const storage = createStorage();
    const { namespace } = createSpaceNamespace();

    const result = await putBlob(
      vault as never,
      { requestId: "req", key: "../secret", size: 1 },
      storage as unknown as DurableObjectStorage,
      namespace as never,
    );

    expect(result).toEqual({ error: expect.any(String) });
    expect(namespace.getByName).not.toHaveBeenCalled();
    expect(mocks.getSignedUrl).not.toHaveBeenCalled();
  });

  it("accounts for put size and signs a prefixed PutObject command", async () => {
    const vault = createVault();
    const storage = createStorage({ spaceId: "spc_1" });
    const { namespace, consume } = createSpaceNamespace(
      vi.fn(async () => ({ space: { used: 20, capacity: 100 } })),
    );

    const result = await putBlob(
      vault as never,
      { requestId: "req", key: "folder/blob", size: 20 },
      storage as unknown as DurableObjectStorage,
      namespace as never,
    );

    expect(consume).toHaveBeenCalledWith(20);
    expect(result).toEqual({
      url: "https://signed.example/blob",
      space: { used: 20, capacity: 100 },
    });
    expect(mocks.getSignedUrl).toHaveBeenCalledWith(
      vault.s3,
      expect.any(PutObjectCommand),
      { expiresIn: 900 },
    );
    const command = mocks.getSignedUrl.mock.calls[0]?.[1] as PutObjectCommand;
    expect(command.input).toEqual({
      Bucket: "bucket",
      Key: "vlt_1/folder/blob",
      ContentLength: 20,
    });
  });

  it("deletes the prefixed object and subtracts cached file size", async () => {
    const vault = createVault();
    const storage = createStorage({
      spaceId: "spc_1",
      "file:folder/blob": { size: 20 },
      currentBytes: 20,
    });
    const { namespace, consume } = createSpaceNamespace(
      vi.fn(async () => ({ space: { used: 0, capacity: 100 } })),
    );

    const result = await deleteBlob(
      vault as never,
      { requestId: "req", key: "folder/blob" },
      storage as unknown as DurableObjectStorage,
      namespace as never,
    );

    expect(vault.s3.send).toHaveBeenCalledWith(expect.any(DeleteObjectCommand));
    const command = vault.s3.send.mock.calls[0]?.[0] as DeleteObjectCommand;
    expect(command.input).toEqual({
      Bucket: "bucket",
      Key: "vlt_1/folder/blob",
    });
    expect(consume).toHaveBeenCalledWith(-20);
    expect(result).toEqual({ space: { used: 0, capacity: 100 } });
  });

  it("signs range reads and counts only requested egress length", async () => {
    const vault = createVault();
    const storage = createStorage({
      "file:folder/blob": { size: 100 },
      currentBytes: 100,
      downloadedBytes: 10,
    });

    const result = await getBlob(
      vault as never,
      { requestId: "req", key: "folder/blob", offset: 5, length: 10 },
      storage as unknown as DurableObjectStorage,
    );

    expect(result).toEqual({ url: "https://signed.example/blob" });
    expect(storage.values.get("downloadedBytes")).toBe(20);
    expect(mocks.getSignedUrl).toHaveBeenCalledWith(
      vault.s3,
      expect.any(GetObjectCommand),
      { expiresIn: 900 },
    );
    const command = mocks.getSignedUrl.mock.calls[0]?.[1] as GetObjectCommand;
    expect(command.input).toEqual({
      Bucket: "bucket",
      Key: "vlt_1/folder/blob",
      Range: "bytes=5-14",
    });
  });

  it("blocks reads over the egress limit and reports once", async () => {
    const vault = createVault();
    const storage = createStorage({
      "file:huge": { size: 1000 * 1000 * 1000 },
      currentBytes: 1,
      downloadedBytes: 999_999_999,
    });

    await expect(
      getBlob(
        vault as never,
        { requestId: "req", key: "huge", offset: 0, length: 2 },
        storage as unknown as DurableObjectStorage,
      ),
    ).resolves.toEqual({ error: "DOWNLOAD_LIMIT_REACHED" });

    await expect(
      getBlob(
        vault as never,
        { requestId: "req", key: "huge", offset: 0, length: 2 },
        storage as unknown as DurableObjectStorage,
      ),
    ).resolves.toEqual({ error: "DOWNLOAD_LIMIT_REACHED" });

    expect(mocks.logsnag).toHaveBeenCalledTimes(1);
    expect(storage.values.get("downloadedBytesReported")).toBe(true);
    expect(mocks.getSignedUrl).not.toHaveBeenCalled();
  });
});
