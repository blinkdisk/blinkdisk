import { mkdirSync, mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

const paths: Record<string, string> = {};

vi.mock("electron", () => ({
  app: {
    getPath: vi.fn((name: string) => {
      const path = paths[name];
      if (!path) throw new Error(`Failed to get '${name}' path`);
      return path;
    }),
  },
}));

import { suggestedFolders } from "@electron/fs";
import { app } from "electron";

describe("suggestedFolders", () => {
  let home: string;

  beforeEach(() => {
    home = mkdtempSync(join(tmpdir(), "blinkdisk-home-"));
    for (const key of Object.keys(paths)) delete paths[key];
    paths.home = home;
  });

  afterEach(() => {
    rmSync(home, { recursive: true, force: true });
  });

  function addFolder(kind: string, name: string) {
    paths[kind] = join(home, name);
    mkdirSync(paths[kind], { recursive: true });
  }

  it("returns the user folders that exist, most important first", async () => {
    addFolder("downloads", "Downloads");
    addFolder("pictures", "Pictures");
    addFolder("documents", "Documents");

    expect(await suggestedFolders()).toEqual([
      { kind: "documents", path: join(home, "Documents") },
      { kind: "pictures", path: join(home, "Pictures") },
      { kind: "downloads", path: join(home, "Downloads") },
    ]);
  });

  it("skips folders the system doesn't define", async () => {
    addFolder("documents", "Documents");

    expect(() => app.getPath("music")).toThrow();
    expect(await suggestedFolders()).toEqual([
      { kind: "documents", path: join(home, "Documents") },
    ]);
  });

  it("skips folders that don't exist on disk", async () => {
    addFolder("documents", "Documents");
    paths.music = join(home, "Music");

    expect(await suggestedFolders()).toEqual([
      { kind: "documents", path: join(home, "Documents") },
    ]);
  });

  it("never suggests the whole home directory or the same folder twice", async () => {
    addFolder("documents", "Documents");
    paths.desktop = home;
    paths.pictures = join(home, "Documents");

    expect(await suggestedFolders()).toEqual([
      { kind: "documents", path: join(home, "Documents") },
    ]);
  });
});
