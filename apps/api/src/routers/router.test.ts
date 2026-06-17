import { appRouter } from "@api/router";
import type { ZConfigType } from "@blinkdisk/schemas/config";
import type { ZVaultType } from "@blinkdisk/schemas/vault";
import { generateId } from "@blinkdisk/utils/id";
import { TRPCError } from "@trpc/server";

const mocks = vi.hoisted(() => ({
  getActiveSubscription: vi.fn(
    (_accountId: unknown, _db: unknown): unknown => undefined,
  ),
  getPolar: vi.fn(
    (_environment: unknown, _token: unknown): unknown => undefined,
  ),
  logsnag: vi.fn(async (_options: unknown) => undefined),
  posthog: vi.fn(async (_event: unknown) => undefined),
  startTrialWorkflow: vi.fn(
    async (_env: unknown, _params: unknown) => undefined,
  ),
  generateServiceToken: vi.fn(
    async (_payload: unknown, _privateKey: unknown) => "service-token",
  ),
}));

vi.mock("@api/lib/polar", () => ({
  getPolar: (environment: unknown, token: unknown) =>
    mocks.getPolar(environment, token),
}));

vi.mock("@api/lib/posthog", () => ({
  posthog: (event: unknown) => mocks.posthog(event),
}));

vi.mock("@api/lib/subscription", () => ({
  getActiveSubscription: (accountId: unknown, db: unknown) =>
    mocks.getActiveSubscription(accountId, db),
}));

vi.mock("@api/lib/workflows", () => ({
  startTrialWorkflow: (env: unknown, params: unknown) =>
    mocks.startTrialWorkflow(env, params),
}));

vi.mock("@blinkdisk/utils/logsnag", () => ({
  logsnag: (options: unknown) => mocks.logsnag(options),
}));

vi.mock("@blinkdisk/utils/token", () => ({
  generateServiceToken: (payload: unknown, privateKey: unknown) =>
    mocks.generateServiceToken(payload, privateKey),
}));

vi.mock("@sentry/cloudflare", () => ({
  captureException: vi.fn(),
}));

type SelectResults = Record<string, unknown[]>;

function createQuery(result: unknown) {
  const query = {
    leftJoin: vi.fn(() => query),
    innerJoin: vi.fn(() => query),
    select: vi.fn(() => query),
    selectAll: vi.fn(() => query),
    where: vi.fn(() => query),
    execute: vi.fn(async () => (Array.isArray(result) ? result : [])),
    executeTakeFirst: vi.fn(async () =>
      Array.isArray(result) ? result[0] : result,
    ),
  };

  return query;
}

function createDb(selects: SelectResults = {}) {
  const operations: {
    inserts: { table: string; values: unknown }[];
    updates: { table: string; values: unknown }[];
    deletes: { table: string }[];
  } = {
    inserts: [],
    updates: [],
    deletes: [],
  };

  const db = {
    operations,
    selectFrom: vi.fn((table: string) => {
      const queue = selects[table] || [];
      const result = queue.length ? queue.shift() : undefined;
      return createQuery(result);
    }),
    insertInto: vi.fn((table: string) => {
      const query = {
        values: vi.fn((values: unknown) => {
          operations.inserts.push({ table, values });
          return query;
        }),
        execute: vi.fn(async () => undefined),
      };

      return query;
    }),
    updateTable: vi.fn((table: string) => {
      const query = {
        set: vi.fn((values: unknown) => {
          operations.updates.push({ table, values });
          return query;
        }),
        where: vi.fn(() => query),
        execute: vi.fn(async () => undefined),
      };

      return query;
    }),
    transaction: vi.fn(() => ({
      execute: vi.fn(async (callback: (trx: never) => Promise<void>) =>
        callback(db as never),
      ),
    })),
  };

  return db;
}

function activeSubscription(result: unknown) {
  const query = {
    select: vi.fn(() => query),
    executeTakeFirst: vi.fn(async () => result),
  };

  return query;
}

function createPolar() {
  return {
    customers: {
      create: vi.fn(async () => ({ id: "cus_new" })),
    },
    checkouts: {
      create: vi.fn(async () => ({
        id: "checkout_1",
        url: "https://checkout.example",
      })),
      get: vi.fn(),
      update: vi.fn(),
    },
    customerSessions: {
      create: vi.fn(async () => ({
        customerPortalUrl: "https://portal.example",
      })),
    },
    subscriptions: {
      update: vi.fn(async () => undefined),
    },
  };
}

function createCaller({
  db = createDb(),
  spaceUsed = 0,
}: {
  db?: ReturnType<typeof createDb>;
  spaceUsed?: number;
} = {}) {
  const waits: Promise<unknown>[] = [];
  const spaceStub = {
    getUsed: vi.fn(async () => spaceUsed),
    init: vi.fn(async () => undefined),
    updateCapacity: vi.fn(async () => undefined),
  };
  const vaultStub = {
    init: vi.fn(async () => undefined),
    delete: vi.fn(async () => undefined),
  };
  const cache = {
    get: vi.fn(async (_key: string): Promise<string | null> => null),
    put: vi.fn(async () => undefined),
  };

  const ctx = {
    account: {
      id: "acct_1",
      email: "user@example.com",
      name: "User Name",
    },
    db,
    env: {
      POLAR_ENVIRONMENT: "sandbox",
      POLAR_TOKEN: "polar-token",
      WEB_URL: "https://app.example",
      CLOUD_JWT_PRIVATE_KEY: "private-key\\\\",
      SPACE: {
        getByName: vi.fn(() => spaceStub),
      },
      VAULT: {
        getByName: vi.fn(() => vaultStub),
      },
      CACHE: cache,
    },
    waitUntil: vi.fn((promise: Promise<unknown>) => {
      waits.push(promise);
    }),
    req: {
      path: "/trpc",
      method: "POST",
      url: "https://api.example/trpc",
      header: vi.fn(() => ({})),
    },
  };

  return {
    caller: appRouter.createCaller(ctx as never),
    ctx,
    waits,
    spaceStub,
    vaultStub,
    cache,
  };
}

async function expectCustomError(
  promise: Promise<unknown>,
  code: string,
): Promise<void> {
  try {
    await promise;
    throw new Error(`Expected ${code}`);
  } catch (error) {
    expect(error).toBeInstanceOf(TRPCError);
    expect((error as TRPCError).cause).toMatchObject({ code });
  }
}

const vaultOptions = {
  version: 2,
  encryption: "AES256-GCM-HMAC-SHA256",
  hash: "BLAKE3-256",
  splitter: "DYNAMIC-4M-BUZHASH",
  errorCorrectionAlgorithm: "REED-SOLOMON-CRC32",
  errorCorrectionOverhead: 10,
} as const;

function createVault(overrides?: Partial<ZVaultType>): ZVaultType {
  return {
    id: generateId("Vault"),
    coreId: "core-id",
    status: "ACTIVE",
    name: "Backups",
    version: 2,
    provider: "CLOUDBLINK",
    configLevel: "VAULT",
    options: vaultOptions,
    spaceId: "spc_1",
    createdAt: new Date().toISOString(),
    ...overrides,
  };
}

function createConfig(overrides?: Partial<ZConfigType>): ZConfigType {
  return {
    id: generateId("Config"),
    data: {
      iv: "iv",
      salt: "salt",
      cipher: "cipher",
    },
    level: "VAULT",
    vaultId: generateId("Vault"),
    createdAt: new Date().toISOString(),
    ...overrides,
  };
}

describe("api router payment procedures", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.getPolar.mockReturnValue(createPolar());
  });

  it("rejects checkout creation when an active subscription exists", async () => {
    mocks.getActiveSubscription.mockReturnValueOnce(
      activeSubscription({ id: "sub_1" }),
    );
    const { caller } = createCaller();

    await expectCustomError(
      caller.payment.checkout({ priceId: "cloud-200-gb-monthly" }),
      "SUBSCRIPTION_EXISTS",
    );
  });

  it("creates a Polar customer and checkout for new subscribers", async () => {
    const polar = createPolar();
    mocks.getPolar.mockReturnValueOnce(polar);
    mocks.getActiveSubscription.mockReturnValueOnce(activeSubscription(null));
    const db = createDb({
      Space: [undefined],
      Account: [{ polarId: null }],
    });
    const { caller, waits } = createCaller({ db });

    await expect(
      caller.payment.checkout({ priceId: "cloud-200-gb-monthly" }),
    ).resolves.toEqual({
      id: "checkout_1",
      url: "https://checkout.example",
    });
    await Promise.all(waits);

    expect(polar.customers.create).toHaveBeenCalledWith({
      externalId: "acct_1",
      email: "user@example.com",
      name: "User Name",
    });
    expect(db.operations.updates).toEqual([
      { table: "Account", values: { polarId: "cus_new" } },
    ]);
    expect(polar.checkouts.create).toHaveBeenCalledWith(
      expect.objectContaining({
        customerId: "cus_new",
        products: ["2cfa7c2d-5b23-4e5d-a041-cfd6738527bb"],
      }),
    );
    expect(mocks.posthog).toHaveBeenCalledWith(
      expect.objectContaining({ event: "checkout_start" }),
    );
  });

  it("blocks checkout when existing cloud usage exceeds selected plan capacity", async () => {
    mocks.getActiveSubscription.mockReturnValueOnce(activeSubscription(null));
    const db = createDb({
      Space: [{ id: "spc_1" }],
    });
    const { caller } = createCaller({
      db,
      spaceUsed: 201 * 1000 * 1000 * 1000,
    });

    await expectCustomError(
      caller.payment.checkout({ priceId: "cloud-200-gb-monthly" }),
      "NOT_ALLOWED",
    );
    expect(mocks.getPolar).not.toHaveBeenCalled();
  });

  it("requires a Polar customer before creating a billing portal session", async () => {
    const db = createDb({
      Account: [{ polarId: null }],
    });
    const { caller } = createCaller({ db });

    await expectCustomError(caller.payment.portal(), "NOT_ALLOWED");
  });

  it.each([
    [
      "cloud-200-gb-monthly",
      "cloud-200-gb-yearly",
      "subscription_period_change",
    ],
    ["cloud-200-gb-monthly", "cloud-500-gb-monthly", "subscription_upgrade"],
    ["cloud-500-gb-monthly", "cloud-200-gb-monthly", "subscription_downgrade"],
  ])("emits %s -> %s change analytics as %s", async (currentPriceId, nextPriceId, event) => {
    const polar = createPolar();
    mocks.getPolar.mockReturnValueOnce(polar);
    mocks.getActiveSubscription.mockReturnValueOnce(
      activeSubscription({
        id: "sub_1",
        priceId: currentPriceId,
        polarSubscriptionId: "polar_sub_1",
      }),
    );
    const db = createDb({
      Space: [{ id: "spc_1" }],
      Subscription: [{ priceId: nextPriceId }],
    });
    const { caller, waits } = createCaller({ db, spaceUsed: 1 });

    await caller.payment.changePlan({ priceId: nextPriceId });
    await Promise.all(waits);

    expect(polar.subscriptions.update).toHaveBeenCalledWith(
      expect.objectContaining({
        id: "polar_sub_1",
        subscriptionUpdate: expect.objectContaining({
          prorationBehavior: "invoice",
        }),
      }),
    );
    expect(mocks.posthog).toHaveBeenCalledWith(
      expect.objectContaining({ event }),
    );
  });
});

describe("api router cloudblink procedures", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("creates a trial-backed space, vault object, cache entry, and service token", async () => {
    const db = createDb({
      Space: [undefined],
    });
    const { caller, ctx, spaceStub, vaultStub, cache } = createCaller({ db });

    const result = await caller.cloudblink.initVault();

    expect(result).toEqual({
      vaultId: expect.any(String),
      spaceId: expect.any(String),
      token: "service-token",
    });
    expect(spaceStub.init).toHaveBeenCalledWith(
      result.spaceId,
      100_000_000_000,
    );
    expect(db.operations.inserts.map((op) => op.table)).toEqual([
      "Trial",
      "Space",
    ]);
    expect(mocks.startTrialWorkflow).toHaveBeenCalledWith(
      ctx.env,
      expect.objectContaining({ trialId: expect.any(String) }),
    );
    expect(mocks.generateServiceToken).toHaveBeenCalledWith(
      { vaultId: result.vaultId },
      "private-key",
    );
    expect(vaultStub.init).toHaveBeenCalledWith(result.spaceId);
    expect(cache.put).toHaveBeenCalledWith(
      `${result.vaultId}:accountId`,
      "acct_1",
      {
        expirationTtl: 300,
      },
    );
  });

  it("blocks CloudBlink vault initialization when existing space has no storage", async () => {
    const db = createDb({
      Space: [{ id: "spc_1", capacity: "0" }],
    });
    const { caller } = createCaller({ db });

    await expectCustomError(caller.cloudblink.initVault(), "NO_STORAGE");
  });

  it("only issues vault tokens for account-owned CloudBlink vaults", async () => {
    const db = createDb({
      Vault: [{ id: "vlt_1", provider: "FILESYSTEM" }],
    });
    const { caller } = createCaller({ db });

    await expectCustomError(
      caller.cloudblink.getVaultToken({ vaultId: "vlt_1" }),
      "INCORRECT_VAULT",
    );
  });

  it("allows deleting a pending CloudBlink vault through the account cache", async () => {
    const db = createDb({
      Vault: [undefined],
    });
    const { caller, cache, vaultStub } = createCaller({ db });
    cache.get.mockResolvedValueOnce("acct_1");

    await caller.cloudblink.deleteVault({ vaultId: "vlt_pending" });

    expect(vaultStub.delete).toHaveBeenCalledWith("vlt_pending", true);
  });
});

describe("api router sync procedures", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("omits account ids from pulled vault and config records", async () => {
    const db = createDb({
      Vault: [
        [
          {
            id: "vlt_1",
            name: "Backups",
            accountId: "acct_1",
          },
        ],
      ],
      Config: [
        [
          {
            id: "cfg_1",
            data: {},
            accountId: "acct_1",
          },
        ],
      ],
    });
    const { caller } = createCaller({ db });

    await expect(caller.vault.pull()).resolves.toEqual({
      items: [{ id: "vlt_1", name: "Backups" }],
    });
    await expect(caller.config.pull()).resolves.toEqual({
      items: [{ id: "cfg_1", data: {} }],
    });
  });

  it("rejects vault pushes when no account space exists", async () => {
    const db = createDb({
      Vault: [[]],
      Space: [undefined],
    });
    const { caller } = createCaller({ db });

    await expectCustomError(
      caller.vault.push({ added: [], modified: [] }),
      "SPACE_NOT_FOUND",
    );
  });

  it("rejects invalid vault ids before inserting remote records", async () => {
    const db = createDb({
      Vault: [[]],
      Space: [{ id: "spc_1" }],
    });
    const { caller } = createCaller({ db });

    await expectCustomError(
      caller.vault.push({
        added: [createVault({ id: "not-valid" })],
        modified: [],
      }),
      "INCORRECT_VAULT",
    );
    expect(db.operations.inserts).toEqual([]);
  });

  it("rejects added configs for vaults the account cannot access", async () => {
    const db = createDb({
      Config: [[]],
      Vault: [[]],
    });
    const { caller } = createCaller({ db });

    await expectCustomError(
      caller.config.push({
        added: [createConfig({ vaultId: generateId("Vault") })],
        modified: [],
      }),
      "VAULT_NOT_FOUND",
    );
  });

  it("rejects modified configs missing from the account", async () => {
    const config = createConfig();
    const db = createDb({
      Config: [[]],
      Vault: [[{ id: config.vaultId }]],
    });
    const { caller } = createCaller({ db });

    await expectCustomError(
      caller.config.push({
        added: [],
        modified: [config],
      }),
      "CONFIG_NOT_FOUND",
    );
  });
});
