const mocks = vi.hoisted(() => ({
  collections: {} as Record<
    string,
    { vault: { find: ReturnType<typeof vi.fn> } }
  >,
  fetchVault: vi.fn(
    async (_vault: unknown, _options: unknown): Promise<unknown> => undefined,
  ),
  getAccountCache: vi.fn((): unknown[] => []),
  getHostName: vi.fn((id: string) => `host-${id}`),
  getUserName: vi.fn((id: string) => `user-${id}`),
  killValidationVault: vi.fn(() => undefined),
  logError: vi.fn((_message: unknown, _error?: unknown) => undefined),
  logWarn: vi.fn((_message: unknown) => undefined),
  mapConfigFields: vi.fn(
    (
      _provider: string,
      _config: unknown,
      version: number | undefined,
      token: string | null | undefined,
    ) => ({
      mapped: true,
      token,
      version,
    }),
  ),
  mapProviderType: vi.fn((provider: string) => `mapped-${provider}`),
  startVaultServer: vi.fn(async (id: string) => ({
    address: `https://127.0.0.1/${id}`,
    password: `password-${id}`,
    controlPassword: `control-${id}`,
    process: {
      kill: vi.fn(),
    },
  })),
}));

vi.mock("@electron/cache", () => ({
  getAccountCache: () => mocks.getAccountCache(),
}));

vi.mock("@electron/db", () => ({
  collections: mocks.collections,
}));

vi.mock("@electron/log", () => ({
  log: {
    error: (message: unknown, error?: unknown) =>
      mocks.logError(message, error),
    warn: (message: unknown) => mocks.logWarn(message),
  },
}));

vi.mock("@electron/profile", () => ({
  getHostName: (id: string) => mocks.getHostName(id),
  getUserName: (id: string) => mocks.getUserName(id),
}));

vi.mock("@electron/vault/fetch", () => ({
  fetchVault: (vault: unknown, options: unknown) =>
    mocks.fetchVault(vault, options),
}));

vi.mock("@electron/vault/mapping", () => ({
  mapConfigFields: (
    provider: string,
    config: unknown,
    version: number | undefined,
    token: string | null | undefined,
  ) => mocks.mapConfigFields(provider, config, version, token),
  mapProviderType: (provider: string) => mocks.mapProviderType(provider),
}));

vi.mock("@electron/vault/server", () => ({
  startVaultServer: (id: string) => mocks.startVaultServer(id),
}));

vi.mock("@electron/vault/validate", () => ({
  validationVault: {
    server: {
      process: {
        kill: () => mocks.killValidationVault(),
      },
    },
  },
}));

import {
  connectVault,
  createVault,
  getVaultStatus,
  initVaults,
  stopAllVaults,
  vaults,
} from "@electron/vault/manage";

function resetVaults() {
  for (const id of Object.keys(vaults)) delete vaults[id];
}

function vaultCollection(ids: string[]) {
  return {
    vault: {
      find: vi.fn(() => ({
        fetch: vi.fn(() =>
          ids.map((id) => ({
            id,
            status: "ACTIVE",
          })),
        ),
      })),
    },
  };
}

describe("vault management", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    resetVaults();
    for (const key of Object.keys(mocks.collections))
      delete mocks.collections[key];
    mocks.fetchVault.mockResolvedValue({ success: true });
    mocks.getAccountCache.mockReturnValue([]);
  });

  it("creates a vault server and sends the repo create payload", async () => {
    const result = await createVault({
      vault: {
        id: "vlt_1",
        name: "Backups",
        provider: "CLOUDBLINK",
        config: {},
        options: {
          version: 2,
          encryption: "AES256-GCM-HMAC-SHA256",
          hash: "BLAKE3-256",
          splitter: "DYNAMIC-4M-BUZHASH",
          errorCorrectionAlgorithm: "REED-SOLOMON-CRC32",
          errorCorrectionOverhead: 10,
        },
        password: "secret",
        token: "service-token",
      },
      userPolicy: { schedule: "user" },
      globalPolicy: { retention: "global" },
    });

    expect(result).toEqual({ success: true });
    expect(mocks.startVaultServer).toHaveBeenCalledWith("vlt_1");
    expect(mocks.fetchVault).toHaveBeenCalledWith(
      expect.objectContaining({ id: "vlt_1" }),
      expect.objectContaining({
        method: "POST",
        path: "/api/v1/repo/create",
        data: expect.objectContaining({
          globalPolicy: { retention: "global" },
          userPolicy: { schedule: "user" },
          clientOptions: {
            description: "Backups",
            username: "user-vlt_1",
            hostname: "host-vlt_1",
          },
          storage: {
            type: "mapped-CLOUDBLINK",
            config: {
              mapped: true,
              token: "service-token",
              version: 2,
            },
          },
          password: "secret",
        }),
      }),
    );
    expect(vaults.vlt_1).toMatchObject({ id: "vlt_1", status: "STARTING" });
  });

  it("stops a newly started vault when repo creation fails", async () => {
    mocks.fetchVault.mockRejectedValueOnce({ code: "CREATE_FAILED" });

    const promise = createVault({
      vault: {
        id: "vlt_1",
        name: "Backups",
        provider: "CLOUDBLINK",
        config: {},
        options: {
          version: 2,
          encryption: "AES256-GCM-HMAC-SHA256",
          hash: "BLAKE3-256",
          splitter: "DYNAMIC-4M-BUZHASH",
          errorCorrectionAlgorithm: "REED-SOLOMON-CRC32",
          errorCorrectionOverhead: 10,
        },
        password: "secret",
      },
      userPolicy: {},
      globalPolicy: {},
    });

    await expect(promise).rejects.toMatchObject({
      code: "CREATE_FAILED",
      message: "CREATE_FAILED",
    });

    const startedServer = await mocks.startVaultServer.mock.results[0]?.value;
    expect(startedServer.process.kill).toHaveBeenCalled();
    expect(vaults.vlt_1).toBeUndefined();
  });

  it("connects through an existing vault server without starting another one", async () => {
    const kill = vi.fn();
    vaults.vlt_1 = {
      id: "vlt_1",
      status: "RUNNING",
      server: {
        process: { kill },
      },
    } as never;

    await expect(
      connectVault({
        id: "vlt_1",
        name: "Backups",
        provider: "CLOUDBLINK",
        config: {},
        password: "secret",
        version: 2,
        token: "service-token",
      }),
    ).resolves.toEqual({ success: true });

    expect(mocks.startVaultServer).not.toHaveBeenCalled();
    expect(mocks.fetchVault).toHaveBeenCalledWith(
      vaults.vlt_1,
      expect.objectContaining({
        method: "POST",
        path: "/api/v1/repo/connect",
        data: expect.objectContaining({
          storage: {
            type: "mapped-CLOUDBLINK",
            config: {
              mapped: true,
              token: "service-token",
              version: 2,
            },
          },
          password: "secret",
        }),
      }),
    );
  });

  it("starts active local/account vaults and shuts down stale vaults", async () => {
    const staleKill = vi.fn();
    vaults.stale = {
      id: "stale",
      status: "RUNNING",
      server: { process: { kill: staleKill } },
    } as never;
    mocks.getAccountCache.mockReturnValue([{ id: "acct_1" }]);
    mocks.collections.local = vaultCollection(["local_active"]);
    mocks.collections.acct_1 = vaultCollection(["remote_active"]);
    mocks.collections.acct_missing = vaultCollection(["missing_active"]);

    await initVaults();

    expect(mocks.startVaultServer).toHaveBeenCalledWith("local_active");
    expect(mocks.startVaultServer).toHaveBeenCalledWith("remote_active");
    expect(mocks.startVaultServer).not.toHaveBeenCalledWith("missing_active");
    expect(staleKill).toHaveBeenCalled();
    expect(vaults.stale).toBeUndefined();
    expect(vaults.local_active).toMatchObject({ status: "STARTING" });
    expect(vaults.remote_active).toMatchObject({ status: "STARTING" });
  });

  it("reports status for running vaults and null for missing vaults", () => {
    vaults.vlt_1 = {
      id: "vlt_1",
      status: "RUNNING",
      initTask: { id: "task_1" },
      server: { process: { kill: vi.fn() } },
    } as never;

    expect(getVaultStatus("vlt_1")).toEqual({
      status: "RUNNING",
      initTask: { id: "task_1" },
    });
    const consoleError = vi
      .spyOn(console, "error")
      .mockImplementation(() => undefined);
    expect(getVaultStatus("missing")).toBeNull();
    consoleError.mockRestore();
  });

  it("stops all running vaults and the validation vault", () => {
    const killA = vi.fn();
    const killB = vi.fn();
    vaults.a = {
      id: "a",
      status: "RUNNING",
      server: { process: { kill: killA } },
    } as never;
    vaults.b = {
      id: "b",
      status: "RUNNING",
      server: { process: { kill: killB } },
    } as never;

    stopAllVaults();

    expect(killA).toHaveBeenCalled();
    expect(killB).toHaveBeenCalled();
    expect(mocks.killValidationVault).toHaveBeenCalled();
    expect(vaults).toEqual({});
  });
});
