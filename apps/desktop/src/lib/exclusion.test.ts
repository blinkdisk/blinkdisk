import { buildExclusionRule, parseExclusionRule } from "./exclusion";

describe("parseExclusionRule", () => {
  describe("extension patterns", () => {
    it("parses *.txt as EXTENSION", () => {
      expect(parseExclusionRule("*.txt")).toEqual({
        type: "EXTENSION",
        extension: "txt",
      });
    });

    it("parses *.tar.gz as EXTENSION", () => {
      expect(parseExclusionRule("*.tar.gz")).toEqual({
        type: "EXTENSION",
        extension: "tar.gz",
      });
    });
  });

  describe("name patterns", () => {
    it("parses exact match", () => {
      expect(parseExclusionRule("README")).toEqual({
        type: "NAME",
        matchType: "EXACT",
        pattern: "README",
        foldersOnly: false,
      });
    });

    it("parses starts with", () => {
      expect(parseExclusionRule("logs*")).toEqual({
        type: "NAME",
        matchType: "STARTS_WITH",
        pattern: "logs",
        foldersOnly: false,
      });
    });

    it("parses ends with", () => {
      expect(parseExclusionRule("*backup")).toEqual({
        type: "NAME",
        matchType: "ENDS_WITH",
        pattern: "backup",
        foldersOnly: false,
      });
    });

    it("parses contains", () => {
      expect(parseExclusionRule("*cache*")).toEqual({
        type: "NAME",
        matchType: "CONTAINS",
        pattern: "cache",
        foldersOnly: false,
      });
    });
  });

  describe("folders only", () => {
    it("detects trailing slash as foldersOnly", () => {
      expect(parseExclusionRule("logs/")).toEqual({
        type: "NAME",
        matchType: "EXACT",
        pattern: "logs",
        foldersOnly: true,
      });
    });

    it("combines foldersOnly with wildcard patterns", () => {
      expect(parseExclusionRule("*cache*/")).toEqual({
        type: "NAME",
        matchType: "CONTAINS",
        pattern: "cache",
        foldersOnly: true,
      });
    });
  });
});

describe("buildExclusionRule", () => {
  it("builds extension rule", () => {
    expect(
      buildExclusionRule({ type: "EXTENSION", extension: "txt" }),
    ).toBe("*.txt");
  });

  it("builds exact match", () => {
    expect(
      buildExclusionRule({
        type: "NAME",
        matchType: "EXACT",
        pattern: "README",
        foldersOnly: false,
      }),
    ).toBe("README");
  });

  it("builds starts with", () => {
    expect(
      buildExclusionRule({
        type: "NAME",
        matchType: "STARTS_WITH",
        pattern: "logs",
        foldersOnly: false,
      }),
    ).toBe("logs*");
  });

  it("builds ends with", () => {
    expect(
      buildExclusionRule({
        type: "NAME",
        matchType: "ENDS_WITH",
        pattern: "backup",
        foldersOnly: false,
      }),
    ).toBe("*backup");
  });

  it("builds contains", () => {
    expect(
      buildExclusionRule({
        type: "NAME",
        matchType: "CONTAINS",
        pattern: "cache",
        foldersOnly: false,
      }),
    ).toBe("*cache*");
  });

  it("appends slash for foldersOnly", () => {
    expect(
      buildExclusionRule({
        type: "NAME",
        matchType: "EXACT",
        pattern: "logs",
        foldersOnly: true,
      }),
    ).toBe("logs/");
  });
});

describe("roundtrip", () => {
  it.each(["*.txt", "README", "logs*", "*backup", "*cache*", "logs/", "*cache*/"])(
    "build(parse(%j)) === %j",
    (rule) => {
      const parsed = parseExclusionRule(rule);
      expect(buildExclusionRule(parsed as any)).toBe(rule);
    },
  );
});
