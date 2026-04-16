vi.mock("@blinkdisk/constants/app", () => ({
  INTERNAL_SCHEME: "app",
  PROTOCOL_API_NS: "api",
  PROTOCOL_FRONTEND_NS: "frontend",
  PROTOCOL_VAULT_NS: "vault",
}));
vi.mock("@blinkdisk/constants/header", () => ({ ACCOUNT_ID_HEADER: "x-account-id" }));
vi.mock("@electron/auth", () => ({ getAccountCookie: vi.fn() }));
vi.mock("@electron/vault/fetch", () => ({ fetchVaultRaw: vi.fn() }));
vi.mock("@electron/vault/manage", () => ({ getVault: vi.fn() }));
vi.mock("electron", () => ({
  app: { isPackaged: false },
  net: { fetch: vi.fn() },
  protocol: { registerSchemesAsPrivileged: vi.fn(), handle: vi.fn() },
}));

import path from "node:path";
import { resolveProtocolPath, isPathSafe } from "@electron/protocol";

describe("resolveProtocolPath", () => {
  const baseDir = "/srv/frontend";

  it('maps "/" to "index.html" within baseDir', () => {
    const result = resolveProtocolPath(baseDir, "/");
    expect(result).toBe(path.resolve(baseDir, "index.html"));
  });

  it('maps "/app.js" to "app.js" within baseDir', () => {
    const result = resolveProtocolPath(baseDir, "/app.js");
    expect(result).toBe(path.resolve(baseDir, "app.js"));
  });

  it('maps "/assets/style.css" to "assets/style.css" within baseDir', () => {
    const result = resolveProtocolPath(baseDir, "/assets/style.css");
    expect(result).toBe(path.resolve(baseDir, "assets/style.css"));
  });
});

describe("isPathSafe", () => {
  const baseDir = "/srv/frontend";

  it("returns true for paths within baseDir", () => {
    const filePath = path.resolve(baseDir, "index.html");
    expect(isPathSafe(baseDir, filePath)).toBe(true);
  });

  it("returns false for path traversal", () => {
    const filePath = path.resolve(baseDir, "../../etc/passwd");
    expect(isPathSafe(baseDir, filePath)).toBe(false);
  });

  it("returns false for absolute paths outside baseDir", () => {
    expect(isPathSafe(baseDir, "/etc/passwd")).toBe(false);
  });

  it("returns true for nested paths", () => {
    const filePath = path.resolve(baseDir, "assets/js/main.js");
    expect(isPathSafe(baseDir, filePath)).toBe(true);
  });
});
