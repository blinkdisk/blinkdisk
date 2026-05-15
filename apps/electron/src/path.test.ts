vi.mock("electron", () => ({
  app: {
    getPath: vi.fn(() => "/mock/appData"),
    isPackaged: false,
  },
}));

import {
  corePath,
  globalAccountDirectory,
  globalConfigDirectory,
  globalVaultDirectory,
  platform,
} from "@electron/path";
import { app } from "electron";

const mockedApp = app as typeof app & { isPackaged: boolean };

describe("platform", () => {
  it("is one of win, mac, or linux", () => {
    expect(["win", "mac", "linux"]).toContain(platform);
  });
});

describe("globalConfigDirectory", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockedApp.isPackaged = false;
  });

  it("contains blinkdisk-dev in dev mode", () => {
    expect(globalConfigDirectory()).toContain("blinkdisk-dev");
  });

  it("contains blinkdisk (not blinkdisk-dev) in packaged mode", () => {
    mockedApp.isPackaged = true;
    const dir = globalConfigDirectory();
    expect(dir).toContain("blinkdisk");
    expect(dir).not.toContain("blinkdisk-dev");
  });
});

describe("globalVaultDirectory", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockedApp.isPackaged = false;
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
    mockedApp.isPackaged = false;
  });

  it("ends with accounts", () => {
    expect(globalAccountDirectory()).toMatch(/accounts$/);
  });
});

describe("corePath", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockedApp.isPackaged = false;
  });

  it("contains go/bin/core in dev mode", () => {
    expect(corePath()).toContain("go/bin/core");
  });
});
