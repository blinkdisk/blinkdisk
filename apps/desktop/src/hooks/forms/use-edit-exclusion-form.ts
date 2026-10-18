import { useAppForm } from "@blinkdisk/forms/use-app-form";
import {
  ZExclusionForm,
  type ZExclusionFormType,
} from "@blinkdisk/schemas/policy";
import {
  buildExclusionRule,
  formatExclusionPath,
  getBrokenExclusionRule,
  parseExclusionRule,
} from "@desktop/lib/exclusion";
import { useMemo } from "react";

export function useEditExclusionForm(
  rule: string | undefined,
  root: string | undefined,
  onSubmit?: (rule: string) => void,
) {
  const parsed = useMemo(
    () => (rule ? parseExclusionRule(rule) : null),
    [rule],
  );

  const path = useMemo(() => {
    if (!rule || parsed?.type !== "PATH" || !parsed.path) return "";
    const broken = getBrokenExclusionRule(rule, root);
    return broken ? broken.input : formatExclusionPath(parsed.path, root);
  }, [rule, parsed, root]);

  const form = useAppForm({
    defaultValues: {
      type: parsed?.type || (root ? "PATH" : "NAME"),
      matchType: parsed?.matchType || "EXACT",
      pattern: parsed?.pattern || "",
      extension: parsed?.extension || "",
      foldersOnly: parsed?.foldersOnly || false,
      path,
    } as ZExclusionFormType,
    validators: {
      onSubmit: ZExclusionForm,
    },
    onSubmit: async ({ value }) => onSubmit?.(buildExclusionRule(value, root)),
  });

  return form;
}
