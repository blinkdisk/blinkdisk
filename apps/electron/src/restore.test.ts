vi.mock("@blinkdisk/schemas/directory", () => ({}));
vi.mock("@electron/fs", () => ({ fileExists: vi.fn() }));
vi.mock("@electron/vault/fetch", () => ({ fetchVault: vi.fn() }));
vi.mock("@electron/vault/manage", () => ({ getVault: vi.fn() }));
vi.mock("@electron/window", () => ({ window: null }));
vi.mock("electron", () => ({ app: { getPath: vi.fn() }, dialog: { showOpenDialog: vi.fn() } }));

import { splitFileName, generateDuplicateName } from "@electron/restore";

describe("splitFileName", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('splits "photo.jpg" into baseName and extension', () => {
    expect(splitFileName("photo.jpg")).toEqual({ baseName: "photo", extension: "jpg" });
  });

  it('splits "archive.tar.gz" keeping compound base name', () => {
    expect(splitFileName("archive.tar.gz")).toEqual({ baseName: "archive.tar", extension: "gz" });
  });

  it('handles "README" with no extension', () => {
    expect(splitFileName("README")).toEqual({ baseName: "README", extension: "" });
  });

  it('handles ".gitignore" as empty baseName with extension', () => {
    expect(splitFileName(".gitignore")).toEqual({ baseName: "", extension: "gitignore" });
  });

  it('splits "file.name.with.dots.txt" correctly', () => {
    expect(splitFileName("file.name.with.dots.txt")).toEqual({
      baseName: "file.name.with.dots",
      extension: "txt",
    });
  });
});

describe("generateDuplicateName", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("generates duplicate name with extension", () => {
    expect(generateDuplicateName("photo", "jpg", 1)).toBe("photo (1).jpg");
  });

  it("generates duplicate name with higher counter", () => {
    expect(generateDuplicateName("photo", "jpg", 2)).toBe("photo (2).jpg");
  });

  it("generates duplicate name without extension", () => {
    expect(generateDuplicateName("README", "", 1)).toBe("README (1)");
  });

  it("generates duplicate name with compound base name", () => {
    expect(generateDuplicateName("archive.tar", "gz", 3)).toBe("archive.tar (3).gz");
  });
});
