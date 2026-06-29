const mocks = vi.hoisted(() => ({
  logsnag: vi.fn(),
  sendEmail: vi.fn(),
  scheduleSpaceAlarm: vi.fn(),
}));

vi.mock("cloudflare:workers", () => ({
  DurableObject: class {
    ctx: DurableObjectState;
    env: Cloudflare.Env;

    constructor(ctx: DurableObjectState, env: Cloudflare.Env) {
      this.ctx = ctx;
      this.env = env;
    }
  },
}));

vi.mock("@blinkdisk/db/index", () => ({
  database: vi.fn(() =>
    createDb({ email: "user@example.com", language: "en" }),
  ),
}));

vi.mock("@blinkdisk/utils/email", () => ({
  sendEmail: (...args: unknown[]) => mocks.sendEmail(...args),
}));

vi.mock("@blinkdisk/utils/logsnag", () => ({
  logsnag: (...args: unknown[]) => mocks.logsnag(...args),
}));

vi.mock("@cloud/utils/alarm", () => ({
  scheduleSpaceAlarm: (...args: unknown[]) => mocks.scheduleSpaceAlarm(...args),
}));

function createStorage(seed?: Record<string, unknown>) {
  const values = new Map(Object.entries(seed || {}));

  return {
    values,
    get: vi.fn(async (key: string) => values.get(key)),
    put: vi.fn(async (key: string, value: unknown) => {
      values.set(key, value);
    }),
    getAlarm: vi.fn(async () => 123),
  };
}

function createDb(account?: { email: string; language: string }) {
  type SelectQuery = Promise<unknown[]> & {
    from: ReturnType<typeof vi.fn>;
    innerJoin: ReturnType<typeof vi.fn>;
    where: ReturnType<typeof vi.fn>;
    limit: ReturnType<typeof vi.fn>;
  };

  const selectQuery = Promise.resolve().then(() =>
    account ? [account] : [],
  ) as SelectQuery;
  selectQuery.from = vi.fn(() => selectQuery);
  selectQuery.innerJoin = vi.fn(() => selectQuery);
  selectQuery.where = vi.fn(() => selectQuery);
  selectQuery.limit = vi.fn(() => selectQuery);

  return {
    update: vi.fn(() => ({
      set: vi.fn(() => ({
        where: vi.fn(async () => undefined),
      })),
    })),
    select: vi.fn(() => selectQuery),
  };
}

async function createSpace(seed?: Record<string, unknown>) {
  const { Space } = await import("@cloud/classes/space");
  const storage = createStorage(seed);
  const ctx = {
    storage,
    blockConcurrencyWhile: vi.fn((callback: () => Promise<void>) => callback()),
  };

  return {
    space: new Space(
      ctx as unknown as DurableObjectState,
      {
        HYPERDRIVE: { connectionString: "postgres://test" },
      } as Cloudflare.Env,
    ),
    storage,
  };
}

describe("Space durable object", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("initializes capacity and rejects positive consumption over capacity", async () => {
    const { space, storage } = await createSpace();

    await space.init("spc_1", 100);

    expect(storage.values.get("spaceId")).toBe("spc_1");
    expect(storage.values.get("capacity")).toBe(100);
    await expect(space.consume(101)).resolves.toEqual({
      error: "STORAGE_FULL",
    });
    expect(storage.values.get("usedBytes")).toBeUndefined();
  });

  it("allows negative consumption and never subtracts below zero", async () => {
    const { space, storage } = await createSpace({
      capacity: 100,
      usedBytes: 25,
    });

    await expect(space.consume(-10)).resolves.toEqual({
      space: { used: 15, capacity: 100 },
    });
    expect(storage.values.get("usedBytes")).toBe(15);

    await space.subtract(50);
    expect(storage.values.get("usedBytes")).toBe(0);
  });

  it("resets notification thresholds when capacity changes", async () => {
    const { space, storage } = await createSpace({
      notifications: [0.7, 0.8],
    });

    await space.updateCapacity(500);

    expect(storage.values.get("capacity")).toBe(500);
    expect(storage.values.get("notifications")).toEqual([]);
  });

  it("sends only the first unreached storage threshold notification", async () => {
    const { space, storage } = await createSpace({
      spaceId: "spc_1",
      capacity: 100,
      usedBytes: 91,
      notifications: [0.7],
    });

    await space.alarm();

    expect(mocks.logsnag).toHaveBeenCalledTimes(1);
    expect(mocks.logsnag).toHaveBeenCalledWith(
      expect.objectContaining({ title: "Storage threshold reached" }),
    );
    expect(mocks.sendEmail).toHaveBeenCalledWith(
      "storageThreshold",
      expect.any(Object),
      { percentage: 91 },
    );
    expect(storage.values.get("notifications")).toEqual([0.7, 0.9]);
  });

  it("does not duplicate already-sent storage threshold notifications", async () => {
    const { space, storage } = await createSpace({
      spaceId: "spc_1",
      capacity: 100,
      usedBytes: 91,
      notifications: [0.7, 0.9],
    });

    await space.alarm();

    expect(mocks.logsnag).not.toHaveBeenCalled();
    expect(mocks.sendEmail).not.toHaveBeenCalled();
    expect(storage.values.get("notifications")).toEqual([0.7, 0.9]);
  });
});
