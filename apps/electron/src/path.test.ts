vi.mock("electron", () => ({
  app: {
    getPath: vi.fn(() => "/mock/appData"),
    isPackaged: false,
  },
}));

import { app } from "electron";
import {
  platform,
  globalConfigDirectory,
  globalVaultDirectory,
  globalAccountDirectory,
  corePath,
} from "@electron/path";

describe("platform", () => {
  it("is one of win, mac, or linux", () => {
    expect(["win", "mac", "linux"]).toContain(platform);
  });
});

describe("globalConfigDirectory", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (app as any).isPackaged = false;
  });

  it("contains blinkdisk-dev in dev mode", () => {
    expect(globalConfigDirectory()).toContain("blinkdisk-dev");
  });

  it("contains blinkdisk (not blinkdisk-dev) in packaged mode", () => {
    (app as any).isPackaged = true;
    const dir = globalConfigDirectory();
    expect(dir).toContain("blinkdisk");
    expect(dir).not.toContain("blinkdisk-dev");
  });
});

describe("globalVaultDirectory", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (app as any).isPackaged = false;
  });

  it("ends with vaults", () => {
    expect(globalVaultDirectory()).toMatch(/vaults$/);
  });

  it("starts with globalConfigDirectory", () => {
    expect(globalVaultDirectory()).toContain(globalConfigDirectory());
  });
});

describe("globalAccountDirectory", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (app as any).isPackaged = false;
  });

  it("ends with accounts", () => {
    expect(globalAccountDirectory()).toMatch(/accounts$/);
  });
});

describe("corePath", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (app as any).isPackaged = false;
  });

  it("contains go/bin/core in dev mode", () => {
    expect(corePath()).toContain("go/bin/core");
  });
});
