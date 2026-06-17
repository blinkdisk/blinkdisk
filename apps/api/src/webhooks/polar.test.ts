import { polarWebhook } from "@api/webhooks/polar";

const mocks = vi.hoisted(() => {
  class WebhookVerificationError extends Error {}

  return {
    WebhookVerificationError,
    validateEvent: vi.fn(
      (_body: unknown, _headers: unknown, _secret: unknown): unknown =>
        undefined,
    ),
    logsnag: vi.fn(async (_options: unknown) => undefined),
    posthog: vi.fn(async (_event: unknown) => undefined),
    startCancellationWorkflow: vi.fn(
      async (_env: unknown, _params: unknown) => undefined,
    ),
    stopCancellationWorkflow: vi.fn(
      async (_env: unknown, _params: unknown) => undefined,
    ),
    stopTrialWorkflow: vi.fn(
      async (_env: unknown, _params: unknown) => undefined,
    ),
    trackAffiliatePayment: vi.fn(
      async (_env: unknown, _fields: unknown) => undefined,
    ),
  };
});

vi.mock("@polar-sh/sdk/webhooks", () => ({
  validateEvent: (body: unknown, headers: unknown, secret: unknown) =>
    mocks.validateEvent(body, headers, secret),
  WebhookVerificationError: mocks.WebhookVerificationError,
}));

vi.mock("@api/lib/affiliate", () => ({
  trackAffiliatePayment: (env: unknown, fields: unknown) =>
    mocks.trackAffiliatePayment(env, fields),
}));

vi.mock("@api/lib/posthog", () => ({
  posthog: (event: unknown) => mocks.posthog(event),
}));

vi.mock("@api/lib/workflows", () => ({
  startCancellationWorkflow: (env: unknown, params: unknown) =>
    mocks.startCancellationWorkflow(env, params),
  stopCancellationWorkflow: (env: unknown, params: unknown) =>
    mocks.stopCancellationWorkflow(env, params),
  stopTrialWorkflow: (env: unknown, params: unknown) =>
    mocks.stopTrialWorkflow(env, params),
}));

vi.mock("@blinkdisk/utils/logsnag", () => ({
  logsnag: (options: unknown) => mocks.logsnag(options),
}));

type SelectResults = Record<string, unknown[]>;

function createQuery(result: unknown) {
  const query = {
    innerJoin: vi.fn(() => query),
    select: vi.fn(() => query),
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
  } = {
    inserts: [],
    updates: [],
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
  };

  return db;
}

function createContext(db = createDb()) {
  const waits: Promise<unknown>[] = [];
  const spaceStub = {
    updateCapacity: vi.fn(async () => undefined),
  };
  const env = {
    POLAR_ENVIRONMENT: "sandbox",
    POLAR_WEBHOOK_SECRET: "secret",
    SPACE: {
      getByName: vi.fn(() => spaceStub),
    },
  };

  return {
    context: {
      req: {
        text: vi.fn(async () => "body"),
        raw: {
          headers: new Headers({ "webhook-id": "evt_1" }),
        },
      },
      env,
      get: vi.fn(() => db),
      executionCtx: {
        waitUntil: vi.fn((promise: Promise<unknown>) => {
          waits.push(promise);
        }),
      },
      json: vi.fn((body: unknown, status = 200) => ({ body, status })),
    },
    waits,
    env,
    spaceStub,
  };
}

function subscriptionEvent(type: string, overrides?: Record<string, unknown>) {
  return {
    type,
    data: {
      id: "polar_sub_1",
      status: "active",
      productId: "2cfa7c2d-5b23-4e5d-a041-cfd6738527bb",
      customerId: "cus_1",
      canceledAt: null,
      endedAt: null,
      cancelAtPeriodEnd: false,
      currentPeriodEnd: null,
      metadata: {},
      ...overrides,
    },
  };
}

describe("polarWebhook", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns a bad request for invalid webhook signatures", async () => {
    mocks.validateEvent.mockImplementationOnce(() => {
      throw new mocks.WebhookVerificationError("bad signature");
    });
    const { context } = createContext();

    await expect(polarWebhook(context as never)).resolves.toEqual({
      body: { error: "Invalid signature" },
      status: 400,
    });
  });

  it("creates subscriptions, updates space, and ends active trials", async () => {
    const trialEndsAt = new Date("2026-01-01T00:00:00.000Z");
    mocks.validateEvent.mockReturnValueOnce(
      subscriptionEvent("subscription.created", {
        metadata: { affiliateId: "ref_1" },
      }),
    );
    const db = createDb({
      Account: [{ id: "acct_1", email: "user@example.com" }],
      Subscription: [[]],
      Space: [{ id: "spc_1", capacity: "0" }],
      Trial: [[{ id: "trial_1", endsAt: trialEndsAt }]],
    });
    const { context, waits, env, spaceStub } = createContext(db);

    await expect(polarWebhook(context as never)).resolves.toEqual({
      body: { success: true },
      status: 202,
    });
    await Promise.all(waits);

    expect(db.operations.inserts).toHaveLength(1);
    expect(db.operations.inserts[0]).toMatchObject({
      table: "Subscription",
      values: {
        status: "ACTIVE",
        priceId: "cloud-200-gb-monthly",
        planId: "cloud-200-gb",
        polarSubscriptionId: "polar_sub_1",
        polarCustomerId: "cus_1",
        accountId: "acct_1",
        affiliateId: "ref_1",
      },
    });
    expect(db.operations.updates).toEqual(
      expect.arrayContaining([
        {
          table: "Space",
          values: expect.objectContaining({
            capacity: "200000000000",
            trialId: null,
          }),
        },
        {
          table: "Trial",
          values: expect.objectContaining({
            status: "ENDED",
            endsAt: null,
          }),
        },
      ]),
    );
    expect(mocks.stopTrialWorkflow).toHaveBeenCalledWith(env, {
      trialId: "trial_1",
      endsAt: trialEndsAt.toISOString(),
    });
    expect(spaceStub.updateCapacity).toHaveBeenCalledWith(200_000_000_000);
    expect(mocks.posthog).toHaveBeenCalledWith(
      expect.objectContaining({ event: "subscription_start" }),
    );
  });

  it("updates subscriptions and space capacity when the plan changes", async () => {
    mocks.validateEvent.mockReturnValueOnce(
      subscriptionEvent("subscription.updated", {
        productId: "aa805de4-5b3d-45e6-87d2-a7ffc8a59416",
      }),
    );
    const db = createDb({
      Subscription: [
        {
          id: "sub_1",
          planId: "cloud-200-gb",
          accountId: "acct_1",
          cleanupAt: null,
          canceledAt: null,
        },
      ],
      Account: [{ id: "acct_1", email: "user@example.com" }],
      Space: [{ id: "spc_1", capacity: "200000000000" }],
      Trial: [[]],
    });
    const { context, spaceStub } = createContext(db);

    await polarWebhook(context as never);

    expect(db.operations.updates).toEqual(
      expect.arrayContaining([
        {
          table: "Subscription",
          values: expect.objectContaining({
            priceId: "cloud-500-gb-monthly",
            planId: "cloud-500-gb",
          }),
        },
        {
          table: "Space",
          values: expect.objectContaining({
            capacity: "500000000000",
            subscriptionId: "sub_1",
            trialId: null,
          }),
        },
      ]),
    );
    expect(spaceStub.updateCapacity).toHaveBeenCalledWith(500_000_000_000);
  });

  it("starts cancellation cleanup when a subscription is canceled", async () => {
    const canceledAt = new Date();
    const endedAt = new Date(Date.now() + 8 * 24 * 60 * 60 * 1000);
    mocks.validateEvent.mockReturnValueOnce(
      subscriptionEvent("subscription.canceled", {
        status: "canceled",
        canceledAt,
        endedAt,
      }),
    );
    const db = createDb({
      Subscription: [
        {
          id: "sub_1",
          planId: "cloud-200-gb",
          accountId: "acct_1",
          cleanupAt: null,
          canceledAt: null,
        },
      ],
      Account: [{ id: "acct_1", email: "user@example.com" }],
    });
    const { context, waits, env } = createContext(db);

    await polarWebhook(context as never);
    await Promise.all(waits);

    expect(db.operations.updates).toContainEqual({
      table: "Subscription",
      values: expect.objectContaining({
        status: "CANCELED",
        cleanupAt: endedAt,
      }),
    });
    expect(mocks.startCancellationWorkflow).toHaveBeenCalledWith(env, {
      subscriptionId: "sub_1",
      cleanupAt: endedAt.toISOString(),
      canceledAt: canceledAt.toISOString(),
    });
    expect(mocks.posthog).toHaveBeenCalledWith(
      expect.objectContaining({ event: "subscription_cancel" }),
    );
  });

  it("stops cancellation cleanup when a subscription is uncanceled", async () => {
    const previousCleanupAt = new Date("2026-02-01T00:00:00.000Z");
    const previousCanceledAt = new Date("2026-01-01T00:00:00.000Z");
    mocks.validateEvent.mockReturnValueOnce(
      subscriptionEvent("subscription.uncanceled"),
    );
    const db = createDb({
      Subscription: [
        {
          id: "sub_1",
          planId: "cloud-200-gb",
          accountId: "acct_1",
          cleanupAt: previousCleanupAt,
          canceledAt: previousCanceledAt,
        },
      ],
      Account: [{ id: "acct_1", email: "user@example.com" }],
    });
    const { context, waits, env } = createContext(db);

    await polarWebhook(context as never);
    await Promise.all(waits);

    expect(db.operations.updates).toContainEqual({
      table: "Subscription",
      values: expect.objectContaining({
        status: "ACTIVE",
        cleanupAt: null,
      }),
    });
    expect(mocks.stopCancellationWorkflow).toHaveBeenCalledWith(env, {
      subscriptionId: "sub_1",
      cleanupAt: previousCleanupAt.toISOString(),
      canceledAt: previousCanceledAt.toISOString(),
    });
    expect(mocks.posthog).toHaveBeenCalledWith(
      expect.objectContaining({ event: "subscription_resume" }),
    );
  });

  it("does not track affiliate payments for paid orders without referral metadata", async () => {
    mocks.validateEvent.mockReturnValueOnce({
      type: "order.paid",
      data: {
        subscriptionId: "polar_sub_1",
        netAmount: 4200,
      },
    });
    const db = createDb({
      Subscription: [
        {
          id: "sub_1",
          affiliateId: null,
          accountId: "acct_1",
          name: "User Name",
          email: "user@example.com",
        },
      ],
    });
    const { context } = createContext(db);

    await expect(polarWebhook(context as never)).resolves.toEqual({
      body: { success: true },
      status: 202,
    });

    expect(mocks.trackAffiliatePayment).not.toHaveBeenCalled();
  });

  it("tracks affiliate payments for paid orders with referral metadata", async () => {
    mocks.validateEvent.mockReturnValueOnce({
      type: "order.paid",
      data: {
        subscriptionId: "polar_sub_1",
        netAmount: 4200,
      },
    });
    const db = createDb({
      Subscription: [
        {
          id: "sub_1",
          affiliateId: "ref_1",
          accountId: "acct_1",
          name: "User Name",
          email: "user@example.com",
        },
      ],
    });
    const { context, env } = createContext(db);

    await expect(polarWebhook(context as never)).resolves.toEqual({
      body: { success: true },
      status: 202,
    });

    expect(mocks.trackAffiliatePayment).toHaveBeenCalledWith(env, {
      referralId: "ref_1",
      email: "user@example.com",
      amount: 4200,
      name: "User Name",
      customerId: "acct_1",
    });
  });
});
