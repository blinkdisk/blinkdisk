import { PolicyContext } from "#components/policy/context";
import { pickDefinedFields } from "#lib/policy";
import { useAppForm } from "@blinkdisk/forms/use-app-form";
import { ZFilesPolicy, ZFilesPolicyType } from "@blinkdisk/schemas/policy";
import { useContext } from "react";

export function usePolicyFilesForm() {
  const { mutate, policy, definedFields, onChange, level } =
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
          files:
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
