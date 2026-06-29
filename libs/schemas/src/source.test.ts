import {
  isFileLikeSource,
  kopiaEntryTypeFromSourceType,
  sourceTypeFromKopiaEntryType,
  sourceTypeWithFallback,
} from "./source";

describe("source type helpers", () => {
  it("maps Kopia entry types to source types", () => {
    expect(sourceTypeFromKopiaEntryType("d")).toBe("directory");
    expect(sourceTypeFromKopiaEntryType("f")).toBe("file");
    expect(sourceTypeFromKopiaEntryType("s")).toBe("symlink");
    expect(sourceTypeFromKopiaEntryType("")).toBeUndefined();
    expect(sourceTypeFromKopiaEntryType(undefined)).toBeUndefined();
  });

  it("maps source types back to Kopia entry types", () => {
    expect(kopiaEntryTypeFromSourceType("directory")).toBe("d");
    expect(kopiaEntryTypeFromSourceType("file")).toBe("f");
    expect(kopiaEntryTypeFromSourceType("symlink")).toBe("s");
    expect(kopiaEntryTypeFromSourceType(undefined)).toBe("d");
  });

  it("falls back to directory for unknown source types", () => {
    expect(sourceTypeWithFallback("file")).toBe("file");
    expect(sourceTypeWithFallback("unknown")).toBe("directory");
    expect(sourceTypeWithFallback(undefined)).toBe("directory");
  });

  it("treats files and symlinks as file-like", () => {
    expect(isFileLikeSource("file")).toBe(true);
    expect(isFileLikeSource("symlink")).toBe(true);
    expect(isFileLikeSource("directory")).toBe(false);
  });
});
