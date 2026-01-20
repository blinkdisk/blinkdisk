import { ZExclusionFormType } from "@schemas/policy";

export function parseExclusionRule(rule: string) {
  const extensionMatch = rule.match(/^\*\.(.+)$/);
  if (extensionMatch && extensionMatch[1]) {
    return {
      type: "EXTENSION" as const,
      extension: extensionMatch[1],
    };
  }

  const isFoldersOnly = rule.endsWith("/");
  const input = isFoldersOnly ? rule.slice(0, -1) : rule;

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

export type MatchType = "EXACT" | "STARTS_WITH" | "ENDS_WITH" | "CONTAINS";

export function buildExclusionRule(values: ZExclusionFormType) {
  let newRule = "";

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
