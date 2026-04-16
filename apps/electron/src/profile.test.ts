vi.mock("@electron/path", () => ({
  globalVaultDirectory: vi.fn(() => "/mock/vaults"),
}));

vi.mock("node:fs", () => ({
  existsSync: vi.fn(),
  readFileSync: vi.fn(),
}));

vi.mock("node:os", () => ({
  userInfo: vi.fn(() => ({ username: "testuser" })),
  hostname: vi.fn(() => "testhost.local"),
}));

import { existsSync, readFileSync } from "node:fs";
import { hostname, userInfo } from "node:os";
import { getHostName, getUserName } from "@electron/profile";

beforeEach(() => {
  vi.clearAllMocks();
});

describe("getUserName", () => {
  it("returns username from config file when it exists", () => {
    vi.mocked(existsSync).mockReturnValue(true);
    vi.mocked(readFileSync).mockReturnValue(
      JSON.stringify({ username: "configuser", hostname: "confighost" }),
    );

    expect(getUserName("vault1")).toBe("configuser");
  });

  it("falls back to OS username when config has no username field", () => {
    vi.mocked(existsSync).mockReturnValue(true);
    vi.mocked(readFileSync).mockReturnValue(JSON.stringify({ hostname: "confighost" }));

    expect(getUserName("vault1")).toBe("testuser");
  });

  it("falls back to OS username when config file doesn't exist", () => {
    vi.mocked(existsSync).mockReturnValue(false);

    expect(getUserName("vault1")).toBe("testuser");
  });

  it('returns "nobody" when OS userInfo throws', () => {
    vi.mocked(existsSync).mockReturnValue(false);
    vi.mocked(userInfo).mockImplementation(() => {
      throw new Error("no user");
    });

    expect(getUserName("vault1")).toBe("nobody");
  });

  it("strips domain prefix on win32", () => {
    const originalPlatform = process.platform;
    Object.defineProperty(process, "platform", { value: "win32", configurable: true });

    vi.mocked(existsSync).mockReturnValue(false);
    vi.mocked(userInfo).mockReturnValue({ username: "DOMAIN\\user" } as ReturnType<typeof userInfo>);

    expect(getUserName("vault1")).toBe("user");

    Object.defineProperty(process, "platform", { value: originalPlatform, configurable: true });
  });
});

describe("getHostName", () => {
  it("returns hostname from config file when it exists", () => {
    vi.mocked(existsSync).mockReturnValue(true);
    vi.mocked(readFileSync).mockReturnValue(
      JSON.stringify({ username: "configuser", hostname: "confighost" }),
    );

    expect(getHostName("vault1")).toBe("confighost");
  });

  it("falls back to OS hostname when config has no hostname field", () => {
    vi.mocked(existsSync).mockReturnValue(true);
    vi.mocked(readFileSync).mockReturnValue(JSON.stringify({ username: "configuser" }));

    expect(getHostName("vault1")).toBe("testhost");
  });

  it("falls back to OS hostname when config file doesn't exist", () => {
    vi.mocked(existsSync).mockReturnValue(false);

    expect(getHostName("vault1")).toBe("testhost");
  });

  it("strips domain suffix from hostname", () => {
    vi.mocked(existsSync).mockReturnValue(false);
    vi.mocked(hostname).mockReturnValue("myhost.example.com");

    expect(getHostName("vault1")).toBe("myhost");
  });

  it('returns "nohost" when OS hostname throws', () => {
    vi.mocked(existsSync).mockReturnValue(false);
    vi.mocked(hostname).mockImplementation(() => {
      throw new Error("no hostname");
    });

    expect(getHostName("vault1")).toBe("nohost");
  });

  it('returns "nohost" when hostname is empty string', () => {
    vi.mocked(existsSync).mockReturnValue(false);
    vi.mocked(hostname).mockReturnValue("");

    expect(getHostName("vault1")).toBe("nohost");
  });
});
