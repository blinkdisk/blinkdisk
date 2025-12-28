import { buildExclusionRule, parseExclusionRule } from "@desktop/lib/exclusion";
import { useAppForm } from "@hooks/use-app-form";
import { ZExclusionForm, ZExclusionFormType } from "@schemas/policy";
import { useMemo } from "react";

export function useEditExclusionForm(
  rule: string | undefined,
  onSubmit?: (rule: string) => void,
) {
  const parsed = useMemo(
    () => (rule ? parseExclusionRule(rule) : null),
    [rule],
  );

  const form = useAppForm({
    defaultValues: {
      type: parsed?.type || "NAME",
      matchType: parsed?.matchType || "EXACT",
      pattern: parsed?.pattern || "",
      extension: parsed?.extension || "",
      foldersOnly: parsed?.foldersOnly || false,
    } as ZExclusionFormType,
    validators: {
      onSubmit: ZExclusionForm,
    },
    onSubmit: async ({ value }) => onSubmit?.(buildExclusionRule(value)),
  });

  return form;
}
