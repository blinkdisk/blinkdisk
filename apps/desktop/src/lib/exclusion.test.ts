import { ZExclusionForm } from "@blinkdisk/schemas/policy";
import {
  buildExclusionRule,
  formatExclusionPath,
  formatRelativeExclusionPath,
  getBrokenExclusionRule,
  isInvalidNamePattern,
  looksLikePath,
  parseExclusionRule,
  toExclusionPath,
} from "@desktop/lib/exclusion";

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

  describe("path patterns", () => {
    it("parses anchored folder paths", () => {
      expect(parseExclusionRule("/AppData/Local/Temp/")).toEqual({
        type: "PATH",
        path: "/AppData/Local/Temp",
        foldersOnly: true,
      });
    });

    it("treats unanchored paths with inner slashes as anchored", () => {
      expect(parseExclusionRule("node/cache")).toEqual({
        type: "PATH",
        path: "/node/cache",
        foldersOnly: false,
      });
    });

    it("unescapes special characters", () => {
      expect(parseExclusionRule("/Games/\\[old\\]")).toEqual({
        type: "PATH",
        path: "/Games/[old]",
        foldersOnly: false,
      });
    });

    it("keeps names with a colon as name patterns", () => {
      expect(parseExclusionRule("a:b")).toEqual({
        type: "NAME",
        matchType: "EXACT",
        pattern: "a:b",
        foldersOnly: false,
      });
    });

    it("keeps wildcard paths as name patterns", () => {
      expect(parseExclusionRule("**/node_modules/")).toEqual({
        type: "NAME",
        matchType: "ENDS_WITH",
        pattern: "*/node_modules",
        foldersOnly: true,
      });
    });

    it("parses Windows paths as broken path rules", () => {
      expect(parseExclusionRule("C:\\Users\\you\\Temp\\")).toEqual({
        type: "PATH",
        path: "C:\\Users\\you\\Temp\\",
        foldersOnly: true,
      });
    });
  });
});

describe("toExclusionPath", () => {
  const windowsRoot = "C:\\Users\\you";

  it.each([
    ["C:\\Users\\you\\AppData\\Local\\Temp\\", "/AppData/Local/Temp"],
    ["c:\\users\\YOU\\AppData\\Local\\Temp", "/AppData/Local/Temp"],
    ['"C:\\Users\\you\\Downloads"', "/Downloads"],
    ["C:/Users/you/Downloads", "/Downloads"],
    ["AppData\\Local\\Temp", "/AppData/Local/Temp"],
    ["/AppData/Local/Temp/", "/AppData/Local/Temp"],
    ["\\AppData\\.\\Local", "/AppData/Local"],
  ])("converts %j inside a Windows root", (input, expected) => {
    expect(toExclusionPath(input, windowsRoot)).toEqual({ path: expected });
  });

  it.each([
    ["/home/you/.cache/", "/.cache"],
    ["Library/Caches", "/Library/Caches"],
  ])("converts %j inside a POSIX root", (input, expected) => {
    expect(toExclusionPath(input, "/home/you")).toEqual({ path: expected });
  });

  it.each([
    ["", windowsRoot, "EMPTY"],
    ["D:\\Data", windowsRoot, "OUTSIDE_ROOT"],
    ["C:\\Users\\other\\Temp", windowsRoot, "OUTSIDE_ROOT"],
    ["C:\\Users\\you\\", windowsRoot, "IS_ROOT"],
    ["AppData\\..\\..\\Temp", windowsRoot, "INVALID"],
    ["C:Users\\foo", windowsRoot, "INVALID"],
    ["C:foo", windowsRoot, "INVALID"],
    ["AppData\\a:b", windowsRoot, "INVALID"],
    ["/etc/hosts", "/home/you", "OUTSIDE_ROOT"],
    ["/home/youtube/x", "/home/you", "OUTSIDE_ROOT"],
    ["C:\\Users\\you\\Temp", undefined, "NEEDS_ROOT"],
  ])("rejects %j in %j with %s", (input, root, error) => {
    expect(toExclusionPath(input, root)).toEqual({ error });
  });

  it("accepts relative paths without a root", () => {
    expect(toExclusionPath("/Library/Caches", undefined)).toEqual({
      path: "/Library/Caches",
    });
  });
});

describe("formatExclusionPath", () => {
  it("joins Windows roots with backslashes", () => {
    expect(formatExclusionPath("/AppData/Local", "C:\\Users\\you\\")).toBe(
      "C:\\Users\\you\\AppData\\Local",
    );
  });

  it("joins POSIX roots", () => {
    expect(formatExclusionPath("/.cache", "/home/you")).toBe(
      "/home/you/.cache",
    );
    expect(formatExclusionPath("/etc", "/")).toBe("/etc");
  });

  it("formats relative paths for display", () => {
    expect(formatRelativeExclusionPath("/AppData/Local", "C:\\Users")).toBe(
      "AppData\\Local",
    );
    expect(formatRelativeExclusionPath("/.cache", "/home/you")).toBe(".cache");
  });
});

describe("getBrokenExclusionRule", () => {
  it("fixes Windows paths inside the root", () => {
    expect(
      getBrokenExclusionRule(
        "c:\\Users\\you\\AppData\\Local\\Temp\\",
        "C:\\Users\\you",
      ),
    ).toEqual({
      input: "c:\\Users\\you\\AppData\\Local\\Temp\\",
      fixed: "/AppData/Local/Temp/",
    });
  });

  it("detects Windows paths outside the root without a fix", () => {
    expect(getBrokenExclusionRule("D:\\Games\\", "C:\\Users\\you")).toEqual({
      input: "D:\\Games\\",
      error: "OUTSIDE_ROOT",
    });
  });

  it("detects Windows paths without a root", () => {
    expect(getBrokenExclusionRule("C:\\Temp")).toEqual({
      input: "C:\\Temp",
      error: "NEEDS_ROOT",
    });
  });

  it("reports the backed-up folder itself and parent segments", () => {
    expect(
      getBrokenExclusionRule("C:\\Users\\you\\", "C:\\Users\\you"),
    ).toEqual({ input: "C:\\Users\\you\\", error: "IS_ROOT" });
    expect(
      getBrokenExclusionRule("C:\\Users\\you\\..\\x", "C:\\Users\\you"),
    ).toEqual({ input: "C:\\Users\\you\\..\\x", error: "INVALID" });
  });

  it("does not fix drive-relative Windows paths", () => {
    expect(getBrokenExclusionRule("C:Users\\foo", "C:\\Users\\you")).toEqual({
      input: "C:Users\\foo",
      error: "INVALID",
    });
  });

  it("does not convert Windows-style rules on POSIX roots", () => {
    expect(
      getBrokenExclusionRule("C:\\Users\\you\\Temp\\", "/home/you"),
    ).toEqual({ input: "C:\\Users\\you\\Temp\\", error: "OUTSIDE_ROOT" });
    expect(getBrokenExclusionRule("Library\\Caches", "/home/you")).toEqual({
      input: "Library\\Caches",
      error: "INVALID",
    });
  });

  it("detects relative Windows paths", () => {
    expect(
      getBrokenExclusionRule("AppData\\Local\\Temp", "C:\\Users\\you"),
    ).toEqual({
      input: "AppData\\Local\\Temp",
      fixed: "/AppData/Local/Temp",
    });
  });

  it("fixes POSIX rules that repeat the root", () => {
    expect(getBrokenExclusionRule("/home/you/.cache/", "/home/you")).toEqual({
      input: "/home/you/.cache",
      fixed: "/.cache/",
    });
  });

  it.each([
    "/AppData/Local/Temp/",
    "*.tmp",
    "node_modules/",
    "\\*important\\*",
    "trailing\\ ",
    "a:b",
  ])("ignores working rule %j", (rule) => {
    expect(getBrokenExclusionRule(rule, "C:\\Users\\you")).toBeNull();
    expect(getBrokenExclusionRule(rule, "/home/you")).toBeNull();
  });
});

describe("path detection", () => {
  it.each(["a/b", "a\\b", "C:"])("detects %j as a path", (value) => {
    expect(looksLikePath(value)).toBe(true);
  });

  it.each(["node_modules", "a:b"])("does not flag %j as a path", (value) => {
    expect(looksLikePath(value)).toBe(false);
  });

  it("only rejects backslashes and drive letters in names", () => {
    expect(isInvalidNamePattern("a\\b")).toBe(true);
    expect(isInvalidNamePattern("C:/foo")).toBe(true);
    expect(isInvalidNamePattern("a:b")).toBe(false);
    expect(isInvalidNamePattern("a/b")).toBe(false);
  });
});

describe("buildExclusionRule", () => {
  it("builds path rules relative to the root", () => {
    expect(
      buildExclusionRule(
        { type: "PATH", path: "C:\\Users\\you\\AppData\\Local\\Temp" },
        "C:\\Users\\you",
      ),
    ).toBe("/AppData/Local/Temp");
  });

  it("keeps folders-only path rules", () => {
    expect(
      buildExclusionRule({
        type: "PATH",
        path: "/AppData/Local",
        foldersOnly: true,
      }),
    ).toBe("/AppData/Local/");
  });

  it("escapes special characters in path rules", () => {
    expect(
      buildExclusionRule({ type: "PATH", path: "/Games/[old] *backup?" }),
    ).toBe("/Games/\\[old] \\*backup\\?");
  });

  it("throws for paths outside the root", () => {
    expect(() =>
      buildExclusionRule({ type: "PATH", path: "D:\\Data" }, "C:\\Users"),
    ).toThrow();
  });

  it("builds extension rule", () => {
    expect(buildExclusionRule({ type: "EXTENSION", extension: "txt" })).toBe(
      "*.txt",
    );
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
  it.each([
    "*.txt",
    "README",
    "logs*",
    "*backup",
    "*cache*",
    "logs/",
    "*cache*/",
    "/AppData/Local/Temp",
    "/AppData/Local/Temp/",
    "/Games/\\[old]",
  ])("build(parse(%j)) === %j", (rule) => {
    const parsed = parseExclusionRule(rule);
    expect(buildExclusionRule(ZExclusionForm.parse(parsed))).toBe(rule);
  });
});
