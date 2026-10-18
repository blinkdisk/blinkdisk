const mocks = vi.hoisted(() => ({
  authenticate: vi.fn(),
  captureException: vi.fn(),
  initAccountCollections: vi.fn(),
  sendWindow: vi.fn(),
  storeSet: vi.fn(),
}));

vi.mock("@better-auth/electron/client", () => ({ electronClient: vi.fn() }));
vi.mock("better-auth/client/plugins", () => ({
  inferAdditionalFields: vi.fn(),
  magicLinkClient: vi.fn(),
}));
vi.mock("better-auth/react", () => ({
  createAuthClient: () => ({ authenticate: mocks.authenticate }),
}));
vi.mock("@electron/db", () => ({
  initAccountCollections: mocks.initAccountCollections,
}));
vi.mock("@electron/store", () => ({
  store: { set: mocks.storeSet },
}));
vi.mock("@electron/window", () => ({ sendWindow: mocks.sendWindow }));
vi.mock("@sentry/electron/main", () => ({
  captureException: mocks.captureException,
}));

import { authenticateToken, tryAuthenticateToken } from "@electron/auth";

beforeEach(() => {
  vi.resetAllMocks();
  mocks.authenticate.mockResolvedValue({
    data: { user: { id: "acct_1" } },
    error: null,
  });
  mocks.initAccountCollections.mockResolvedValue(undefined);
  mocks.sendWindow.mockReturnValue(true);
});

describe("authenticateToken", () => {
  it("activates an account only after collections and the account-added event", async () => {
    let finishInitialization: (() => void) | undefined;
    mocks.initAccountCollections.mockImplementation(
      () =>
        new Promise<void>((resolve) => {
          finishInitialization = resolve;
        }),
    );

    const authentication = authenticateToken({ token: "code" });
    await vi.waitFor(() =>
      expect(mocks.initAccountCollections).toHaveBeenCalledWith("acct_1"),
    );

    expect(mocks.storeSet).not.toHaveBeenCalled();
    expect(mocks.sendWindow).not.toHaveBeenCalled();

    finishInitialization?.();
    await authentication;

    expect(mocks.sendWindow).toHaveBeenCalledWith("auth.onAccountAdd", {
      accountId: "acct_1",
    });
    expect(mocks.sendWindow.mock.invocationCallOrder[0]).toBeLessThan(
      mocks.storeSet.mock.invocationCallOrder[0] as number,
    );
    expect(mocks.storeSet).toHaveBeenCalledWith("accounts.acct_1.active", true);
  });

  it("returns a successful result and forwards the code to authentication", async () => {
    expect(await tryAuthenticateToken({ token: "code" })).toEqual({ ok: true });
    expect(mocks.authenticate).toHaveBeenCalledWith({ token: "code" });
  });

  it("does not activate an account when collection initialization fails", async () => {
    const failure = new Error("initialization failed");
    mocks.initAccountCollections.mockRejectedValue(failure);

    await expect(authenticateToken({ token: "code" })).rejects.toBe(failure);

    expect(mocks.storeSet).not.toHaveBeenCalled();
    expect(mocks.sendWindow).not.toHaveBeenCalled();
    expect(mocks.captureException).toHaveBeenCalledWith(failure);
  });

  it("does not activate an account when the account-added event cannot be sent", async () => {
    mocks.sendWindow.mockReturnValue(false);

    expect(await tryAuthenticateToken({ token: "code" })).toEqual({
      ok: false,
      reason: "unexpectedError",
    });

    expect(mocks.storeSet).not.toHaveBeenCalled();
    expect(mocks.captureException).toHaveBeenCalledWith(
      expect.objectContaining({ message: "Account window unavailable" }),
    );
  });

  it("returns distinct token and connection failures to the paste dialog", async () => {
    mocks.authenticate.mockResolvedValueOnce({
      data: null,
      error: { status: 401, message: "Rejected" },
    });
    expect(await tryAuthenticateToken({ token: "code" })).toEqual({
      ok: false,
      reason: "invalidCode",
    });

    mocks.authenticate.mockResolvedValueOnce({
      data: null,
      error: { status: 503, message: "Unavailable" },
    });
    expect(await tryAuthenticateToken({ token: "code" })).toEqual({
      ok: false,
      reason: "networkError",
    });

    mocks.authenticate.mockResolvedValueOnce({
      data: null,
      error: { status: 429, message: "Rate limited" },
    });
    expect(await tryAuthenticateToken({ token: "code" })).toEqual({
      ok: false,
      reason: "networkError",
    });

    expect(mocks.storeSet).not.toHaveBeenCalled();
    expect(mocks.captureException).not.toHaveBeenCalled();
  });

  it("distinguishes a failed fetch from a collection TypeError", async () => {
    mocks.authenticate.mockRejectedValueOnce(new TypeError("fetch failed"));
    expect(await tryAuthenticateToken({ token: "code" })).toEqual({
      ok: false,
      reason: "networkError",
    });
    expect(mocks.captureException).not.toHaveBeenCalled();

    const failure = new TypeError("collection setup failed");
    mocks.initAccountCollections.mockRejectedValueOnce(failure);
    expect(await tryAuthenticateToken({ token: "code" })).toEqual({
      ok: false,
      reason: "unexpectedError",
    });
    expect(mocks.captureException).toHaveBeenCalledWith(failure);
    expect(mocks.storeSet).not.toHaveBeenCalled();
  });
});
