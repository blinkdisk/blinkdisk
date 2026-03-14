import { useAppForm } from "@blinkdisk/forms/use-app-form";
import {
  ZCompressionPolicy,
  ZCompressionPolicyType,
} from "@blinkdisk/schemas/policy";
import { PolicyContext } from "@desktop/components/policy/context";
import { pickDefinedFields } from "@desktop/lib/policy";
import { useContext } from "react";

export function usePolicyCompressionForm() {
  const { mutate, policy, definedFields, onChange, level } =
    useContext(PolicyContext);

  const form = useAppForm({
    defaultValues: {
      ...policy?.effective?.compression,
      algorithm: policy?.effective?.compression?.algorithm || "",
      definedFields: definedFields?.compression,
    } as ZCompressionPolicyType & {
      definedFields?: string[];
    },
    validators: {
      onSubmit: ZCompressionPolicy,
    },
    listeners: {
      onChange,
    },
    onSubmit: async ({ value }) =>
      policy &&
      (await mutate(
        {
          ...policy.defined,
          compression:
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
