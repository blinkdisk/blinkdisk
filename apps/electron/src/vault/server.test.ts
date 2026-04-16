vi.mock("@blinkdisk/utils/id", () => ({ generateId: vi.fn(() => "mock-id") }));
vi.mock("@blinkdisk/utils/try-catch", () => ({ tryCatch: vi.fn() }));
vi.mock("@electron/log", () => ({ log: { info: vi.fn(), error: vi.fn() } }));
vi.mock("@electron/path", () => ({ corePath: vi.fn(), globalVaultDirectory: vi.fn(() => "/mock") }));
vi.mock("@electron/vault/fetch", () => ({ fetchVault: vi.fn() }));
vi.mock("@electron/vault/manage", () => ({ vaults: {} }));
vi.mock("@electron/window", () => ({ sendWindow: vi.fn() }));
vi.mock("child_process", () => ({ spawn: vi.fn() }));
vi.mock("electron", () => ({ app: { isPackaged: false } }));
vi.mock("tough-cookie", () => ({ CookieJar: vi.fn() }));

import { parseServerLine, calculateStatusPollDelay } from "@electron/vault/server";

describe("parseServerLine", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("parses SERVER ADDRESS line", () => {
    const result = parseServerLine("SERVER ADDRESS: https://127.0.0.1:12345");
    expect(result).toEqual({ key: "SERVER ADDRESS", value: "https://127.0.0.1:12345" });
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
    expect(result).toEqual({ key: "SERVER CERTIFICATE", value: encoded, decoded: "hello" });
  });

  it("parses BDC SPACE UPDATE line with JSON", () => {
    const result = parseServerLine('BDC SPACE UPDATE: {"used":100}');
    expect(result).toEqual({ key: "BDC SPACE UPDATE", value: '{"used":100}', parsed: { used: 100 } });
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
