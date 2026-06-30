import { useAppForm } from "@blinkdisk/forms/use-app-form";
import {
  ZExclusionForm,
  type ZExclusionFormType,
} from "@blinkdisk/schemas/policy";
import { buildExclusionRule, parseExclusionRule } from "@desktop/lib/exclusion";

export function useEditExclusionForm(
  rule: string | undefined,
  onSubmit?: (rule: string) => void,
) {
  const parsed = rule ? parseExclusionRule(rule) : null;

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
