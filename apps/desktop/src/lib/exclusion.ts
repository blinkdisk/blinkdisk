import type { ZExclusionFormType } from "@blinkdisk/schemas/policy";

export type ParsedExclusionRule = {
  type: ZExclusionFormType["type"];
  matchType?: MatchType;
  pattern?: string;
  extension?: string;
  foldersOnly?: boolean;
  path?: string;
};

export function parseExclusionRule(rule: string): ParsedExclusionRule {
  if (isWindowsPathRule(rule)) {
    return { type: "PATH", path: rule, foldersOnly: /[\\/]$/.test(rule) };
  }

  const extensionMatch = rule.match(/^\*\.(.+)$/);
  if (extensionMatch?.[1]) {
    return {
      type: "EXTENSION" as const,
      extension: extensionMatch[1],
    };
  }

  const isFoldersOnly = rule.endsWith("/");
  const input = isFoldersOnly ? rule.slice(0, -1) : rule;

  if (input.includes("/") && isLiteralPattern(input)) {
    return {
      type: "PATH",
      path: `/${unescapePattern(input).replace(/^\/+/, "")}`,
      foldersOnly: isFoldersOnly,
    };
  }

  let matchType: MatchType;
  let pattern: string;

  if (input.startsWith("*") && input.endsWith("*")) {
    matchType = "CONTAINS";
    pattern = input.slice(1, -1);
  } else if (input.startsWith("*")) {
    matchType = "ENDS_WITH";
    pattern = input.slice(1);
  } else if (input.endsWith("*")) {
    matchType = "STARTS_WITH";
    pattern = input.slice(0, -1);
  } else {
    matchType = "EXACT";
    pattern = input;
  }

  return {
    type: "NAME" as const,
    matchType,
    pattern,
    foldersOnly: isFoldersOnly,
  };
}

type MatchType = "EXACT" | "STARTS_WITH" | "ENDS_WITH" | "CONTAINS";

export function buildExclusionRule(values: ZExclusionFormType, root?: string) {
  let newRule = "";

  if (values.type === "PATH") {
    const result = toExclusionPath(values.path, root);
    if ("error" in result) {
      throw new Error(`Invalid exclusion path: ${result.error}`);
    }

    return buildPathRule(result.path, values.foldersOnly);
  }

  if (values.type === "EXTENSION") {
    if (values.extension) {
      newRule = `*.${values.extension}`;
    }
  } else {
    if (values.matchType === "STARTS_WITH") {
      newRule = `${values.pattern}*`;
    } else if (values.matchType === "ENDS_WITH") {
      newRule = `*${values.pattern}`;
    } else if (values.matchType === "CONTAINS") {
      newRule = `*${values.pattern}*`;
    } else {
      newRule = values.pattern;
    }

    if (values.foldersOnly) {
      newRule = `${newRule}/`;
    }
  }

  return newRule;
}

export type ExclusionPathError =
  | "EMPTY"
  | "INVALID"
  | "IS_ROOT"
  | "OUTSIDE_ROOT"
  | "NEEDS_ROOT";

/**
 * Converts a user-entered path (absolute, or relative to the backed-up folder)
 * into the root-relative, forward-slash form Kopia's ignore rules expect,
 * e.g. `C:\Users\you\AppData\Local\Temp` -> `/AppData/Local/Temp`.
 */
export function toExclusionPath(
  input: string,
  root?: string,
): { path: string } | { error: ExclusionPathError } {
  const value = stripQuotes(input.trim());
  if (!value) return { error: "EMPTY" };
  if (root && !isWindowsPath(root) && isWindowsPath(value)) {
    return { error: "OUTSIDE_ROOT" };
  }

  const windows = root
    ? isWindowsPath(root)
    : isWindowsPath(value) || value.includes("\\");
  const absolute = windows
    ? isWindowsPath(value)
    : !!root && value.startsWith("/");

  const segments = splitPath(value, windows);
  if (segments.includes("..")) return { error: "INVALID" };

  let relative = segments;

  if (absolute) {
    if (!root) return { error: "NEEDS_ROOT" };

    const rootSegments = splitPath(root, windows);
    const isInside = rootSegments.every((segment, index) => {
      const other = segments[index];
      if (other === undefined) return false;
      return windows
        ? segment.toLowerCase() === other.toLowerCase()
        : segment === other;
    });

    if (!isInside) return { error: "OUTSIDE_ROOT" };
    relative = segments.slice(rootSegments.length);
    if (relative.length === 0) return { error: "IS_ROOT" };
  }

  if (relative.length === 0) return { error: "EMPTY" };

  return { path: `/${relative.join("/")}` };
}

function buildPathRule(path: string, foldersOnly?: boolean) {
  const rule = `/${path
    .replace(/^\/+/, "")
    .split("/")
    .map((segment) => segment.replace(/[\\*?[]/g, (char) => `\\${char}`))
    .join("/")}`;

  return foldersOnly ? `${rule}/` : rule;
}

/** Turns a root-relative path like `/AppData/Local/Temp` into a full path. */
export function formatExclusionPath(path: string, root?: string) {
  if (!root) return path;

  if (isWindowsPath(root)) {
    return `${root.replace(/[\\/]+$/, "")}${path.replaceAll("/", "\\")}`;
  }

  return `${root.replace(/\/+$/, "")}${path}`;
}

/** Formats a root-relative path for display, e.g. `AppData\Local\Temp`. */
export function formatRelativeExclusionPath(path: string, root?: string) {
  const relative = path.replace(/^\/+/, "");
  return root && isWindowsPath(root)
    ? relative.replaceAll("/", "\\")
    : relative;
}

export type BrokenExclusionRule = {
  /** The path the user most likely meant, as they entered it. */
  input: string;
  /** A working replacement rule, if the path is inside the backed-up folder. */
  fixed?: string;
  /** Why no replacement rule could be created. */
  error?: ExclusionPathError;
};

/**
 * Detects rules that were entered as full paths (e.g. `C:\Users\you\Temp\`).
 * Kopia treats `\` as an escape character and anchors rules to the backed-up
 * folder, so these rules never match anything.
 */
export function getBrokenExclusionRule(
  rule: string,
  root?: string,
): BrokenExclusionRule | null {
  let input: string | undefined;
  let foldersOnly = false;

  if (isWindowsPathRule(rule)) {
    input = rule;
    foldersOnly = /[\\/]$/.test(rule);
  } else if (root && !isWindowsPath(root)) {
    const parsed = parseExclusionRule(rule);
    const rootSegments = splitPath(root, false);

    if (parsed.type === "PATH" && parsed.path && rootSegments.length > 0) {
      const segments = splitPath(parsed.path, false);
      const repeatsRoot =
        segments.length > rootSegments.length &&
        rootSegments.every((segment, index) => segment === segments[index]);

      if (repeatsRoot) {
        input = parsed.path;
        foldersOnly = !!parsed.foldersOnly;
      }
    }
  }

  if (!input) return null;

  const result = toExclusionPath(input, root);
  if ("error" in result) return { input, error: result.error };

  // On POSIX, "\" is a valid filename character, so a Windows-style rule
  // can't be converted safely.
  if (root && !isWindowsPath(root) && input.includes("\\")) {
    return { input, error: "INVALID" };
  }

  return { input, fixed: buildPathRule(result.path, foldersOnly) };
}

/** Whether a name pattern looks like the user typed a path instead. */
export function looksLikePath(value: string) {
  return /[\\/]/.test(value) || isWindowsPath(value);
}

/** Whether a name pattern contains characters that can never be part of a working name rule. */
export function isInvalidNamePattern(value: string) {
  return value.includes("\\") || isWindowsPath(value);
}

function isWindowsPath(path: string) {
  return /^[a-zA-Z]:(?:[\\/]|$)/.test(path) || path.startsWith("\\\\");
}

function isWindowsPathRule(rule: string) {
  if (isWindowsPath(rule)) return true;

  for (let i = 0; i < rule.length; i++) {
    if (rule[i] !== "\\") continue;
    if (!ESCAPABLE.includes(rule[i + 1] ?? "")) return true;
    i++;
  }

  return false;
}

const ESCAPABLE = ["\\", "*", "?", "[", "]", " ", "!", "#"];

function isLiteralPattern(pattern: string) {
  if (pattern.startsWith("!") || pattern.startsWith("#")) return false;

  for (let i = 0; i < pattern.length; i++) {
    const char = pattern[i];
    if (char === "\\") {
      i++;
    } else if (char === "*" || char === "?" || char === "[") {
      return false;
    }
  }

  return true;
}

function unescapePattern(pattern: string) {
  return pattern.replace(/\\(.)/g, "$1");
}

function splitPath(path: string, windows: boolean) {
  return path
    .split(windows ? /[\\/]+/ : /\/+/)
    .filter((segment) => segment !== "" && segment !== ".");
}

function stripQuotes(value: string) {
  const match = value.match(/^(["'])(.*)\1$/);
  return match?.[2]?.trim() ?? value;
}
