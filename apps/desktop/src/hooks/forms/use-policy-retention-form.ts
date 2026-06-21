import { useAppForm } from "@blinkdisk/forms/use-app-form";
import {
  ZRetentionPolicy,
  type ZRetentionPolicyType,
} from "@blinkdisk/schemas/policy";
import { PolicyContext } from "@desktop/components/policy/context";
import { pickDefinedFields } from "@desktop/lib/policy";
import { useContext } from "react";

export function usePolicyRetentionForm() {
  const { mutate, policy, definedFields, onChange, inherited } =
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
          retention: inherited
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
