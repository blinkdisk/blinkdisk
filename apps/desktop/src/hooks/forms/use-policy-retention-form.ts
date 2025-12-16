import { PolicyContext } from "@desktop/components/policy/context";
import { pickDefinedFields } from "@desktop/lib/policy";
import { useAppForm } from "@hooks/use-app-form";
import { ZRetentionPolicy, ZRetentionPolicyType } from "@schemas/policy";
import { useContext } from "react";

export function usePolicyRetentionForm() {
  const { mutate, policy, definedFields, onChange, level } =
    useContext(PolicyContext);

  const form = useAppForm({
    defaultValues: {
      ...policy?.effective?.retention,
      definedFields: definedFields?.retention,
    } as ZRetentionPolicyType & {
      definedFields?: string[];
    },
    validators: {
      onSubmit: ZRetentionPolicy,
    },
    listeners: {
      onChange,
    },
    onSubmit: async ({ value }) =>
      policy &&
      (await mutate(
        {
          ...policy.defined,
          retention:
            level === "FOLDER"
              ? pickDefinedFields(value, value.definedFields || [])
              : value,
        },
        {
          onSuccess: () => form.reset(),
        },
      )),
  });

  return form;
}
