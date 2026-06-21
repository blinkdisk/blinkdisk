import { useAppForm } from "@blinkdisk/forms/use-app-form";
import { ZFilesPolicy, type ZFilesPolicyType } from "@blinkdisk/schemas/policy";
import { PolicyContext } from "@desktop/components/policy/context";
import { pickDefinedFields } from "@desktop/lib/policy";
import { useContext } from "react";

export function usePolicyFilesForm() {
  const { mutate, policy, definedFields, onChange, inherited } =
    useContext(PolicyContext);

  const form = useAppForm({
    defaultValues: {
      ...policy?.effective?.files,
      excludeCacheDirs: policy?.effective?.files?.excludeCacheDirs || false,
      definedFields: definedFields?.files,
    } as ZFilesPolicyType & {
      definedFields?: string[];
    },
    validators: {
      onSubmit: ZFilesPolicy,
    },
    listeners: {
      onChange,
    },
    onSubmit: async ({ value }) =>
      policy &&
      (await mutate(
        {
          ...policy.defined,
          files: inherited
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
