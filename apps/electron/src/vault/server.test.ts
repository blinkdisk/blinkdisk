vi.mock("@blinkdisk/utils/id", () => ({ generateId: vi.fn(() => "mock-id") }));
vi.mock("@blinkdisk/utils/try-catch", () => ({ tryCatch: vi.fn() }));
vi.mock("@electron/log", () => ({ log: { info: vi.fn(), error: vi.fn() } }));
vi.mock("@electron/path", () => ({
  corePath: vi.fn(),
  globalVaultDirectory: vi.fn(() => "/mock"),
}));
vi.mock("@electron/vault/fetch", () => ({ fetchVault: vi.fn() }));
vi.mock("@electron/vault/manage", () => ({ vaults: {} }));
vi.mock("@electron/window", () => ({ sendWindow: vi.fn() }));
vi.mock("child_process", () => ({ spawn: vi.fn() }));
vi.mock("node:child_process", () => ({ spawn: vi.fn() }));
vi.mock("electron", () => ({ app: { isPackaged: false } }));
vi.mock("tough-cookie", () => ({ CookieJar: vi.fn() }));

import { spawn } from "node:child_process";
import { EventEmitter } from "node:events";
import { VAULT_SERVER_START_TIMEOUT_MS } from "@blinkdisk/constants/vault";
import { tryCatch } from "@blinkdisk/utils/try-catch";
import {
  calculateStatusPollDelay,
  parseServerLine,
  startVaultServer,
} from "@electron/vault/server";
import { CookieJar } from "tough-cookie";

describe("parseServerLine", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("parses SERVER ADDRESS line", () => {
    const result = parseServerLine("SERVER ADDRESS: https://127.0.0.1:12345");
    expect(result).toEqual({
      key: "SERVER ADDRESS",
      value: "https://127.0.0.1:12345",
    });
  });

  it("parses SERVER PASSWORD line", () => {
    const result = parseServerLine("SERVER PASSWORD: abc123");
    expect(result).toEqual({ key: "SERVER PASSWORD", value: "abc123" });
  });

  it("parses SERVER CONTROL PASSWORD line", () => {
    const result = parseServerLine("SERVER CONTROL PASSWORD: xyz789");
    expect(result).toEqual({ key: "SERVER CONTROL PASSWORD", value: "xyz789" });
  });

  it("parses SERVER CERT SHA256 line", () => {
    const result = parseServerLine("SERVER CERT SHA256: abcdef");
    expect(result).toEqual({ key: "SERVER CERT SHA256", value: "abcdef" });
  });

  it("parses SERVER CERTIFICATE line and decodes base64", () => {
    const encoded = Buffer.from("hello").toString("base64");
    const result = parseServerLine(`SERVER CERTIFICATE: ${encoded}`);
    expect(result).toEqual({
      key: "SERVER CERTIFICATE",
      value: encoded,
      decoded: "hello",
    });
  });

  it("parses BDC SPACE UPDATE line with JSON", () => {
    const result = parseServerLine('BDC SPACE UPDATE: {"used":100}');
    expect(result).toEqual({
      key: "BDC SPACE UPDATE",
      value: '{"used":100}',
      parsed: { used: 100 },
    });
  });

  it("returns BDC VAULT DELETED for vault deleted lines", () => {
    const result = parseServerLine("BDC VAULT DELETED: ");
    expect(result).toEqual({ key: "BDC VAULT DELETED" });
  });

  it("returns NOTIFICATION for notification lines", () => {
    const result = parseServerLine("NOTIFICATION: something");
    expect(result).toEqual({ key: "NOTIFICATION" });
  });

  it("returns null for lines without delimiter", () => {
    const result = parseServerLine("no delimiter here");
    expect(result).toBeNull();
  });

  it("returns unknown for unrecognized keys", () => {
    const line = "SOME OTHER KEY: value";
    const result = parseServerLine(line);
    expect(result).toEqual({ key: "unknown", raw: line });
  });
});

describe("startVaultServer", () => {
  function createMockProcess() {
    // biome-ignore lint/suspicious/noExplicitAny: minimal child process stub
    const proc = new EventEmitter() as any;
    proc.stdout = new EventEmitter();
    proc.stderr = new EventEmitter();
    proc.kill = vi.fn();
    return proc;
  }

  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();
    vi.mocked(tryCatch).mockImplementation(
      // biome-ignore lint/suspicious/noExplicitAny: passthrough stub
      (fn: any) => (typeof fn === "function" ? [fn(), undefined] : fn),
    );
    const cookieJarStub = function (this: Record<string, unknown>) {
      this.setCookieSync = vi.fn();
      this.getCookieStringSync = vi.fn();
    };
    vi.mocked(CookieJar).mockImplementation(
      cookieJarStub as unknown as () => CookieJar,
    );
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("rejects and kills the process when startup times out", async () => {
    const proc = createMockProcess();
    vi.mocked(spawn).mockReturnValue(proc);

    const promise = startVaultServer("test", false);
    const expectation = expect(promise).rejects.toMatchObject({
      code: "VAULT_SERVER_UNAVAILABLE",
    });

    await vi.advanceTimersByTimeAsync(VAULT_SERVER_START_TIMEOUT_MS);
    await expectation;
    expect(proc.kill).toHaveBeenCalled();
  });

  it("rejects when the process fails to spawn", async () => {
    const proc = createMockProcess();
    vi.mocked(spawn).mockReturnValue(proc);

    const promise = startVaultServer("test", false);
    const expectation = expect(promise).rejects.toMatchObject({
      code: "VAULT_SERVER_UNAVAILABLE",
    });

    proc.emit("error", new Error("spawn ENOENT"));
    await expectation;
  });

  it("rejects when the process exits before it is ready", async () => {
    const proc = createMockProcess();
    vi.mocked(spawn).mockReturnValue(proc);

    const promise = startVaultServer("test", false);
    const expectation = expect(promise).rejects.toMatchObject({
      code: "VAULT_SERVER_UNAVAILABLE",
    });

    proc.emit("exit", 1);
    await expectation;
  });

  it("resolves once all startup lines are parsed and does not settle again", async () => {
    const proc = createMockProcess();
    vi.mocked(spawn).mockReturnValue(proc);

    const promise = startVaultServer("test", false);

    const cert = Buffer.from("certificate").toString("base64");
    proc.stderr.emit(
      "data",
      [
        "SERVER ADDRESS: https://127.0.0.1:12345",
        "SERVER PASSWORD: pw",
        "SERVER CONTROL PASSWORD: cpw",
        "SERVER CERT SHA256: hash",
        `SERVER CERTIFICATE: ${cert}`,
      ].join("\n"),
    );

    const server = await promise;
    expect(server.address).toBe("https://127.0.0.1:12345");
    expect(server.password).toBe("pw");

    await vi.advanceTimersByTimeAsync(VAULT_SERVER_START_TIMEOUT_MS);
    proc.emit("exit", 0);
    expect(proc.kill).not.toHaveBeenCalled();
  });
});

describe("calculateStatusPollDelay", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns 100 for iteration 1", () => {
    expect(calculateStatusPollDelay(1)).toBe(100);
  });

  it("returns 500 for iteration 5", () => {
    expect(calculateStatusPollDelay(5)).toBe(500);
  });

  it("returns 900 for iteration 9", () => {
    expect(calculateStatusPollDelay(9)).toBe(900);
  });

  it("returns 1000 for iteration 10", () => {
    expect(calculateStatusPollDelay(10)).toBe(1000);
  });

  it("returns 1000 for iteration 100", () => {
    expect(calculateStatusPollDelay(100)).toBe(1000);
  });
});
