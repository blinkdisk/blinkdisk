import { PolicyContext } from "@desktop/hooks/use-policy-context";
import { useAppForm } from "@hooks/use-app-form";
import { ZFilesPolicy, ZFilesPolicyType } from "@schemas/policy";

export function usePolicyFilesForm({ policy, mutate }: PolicyContext) {
  const form = useAppForm({
    defaultValues: policy?.files as ZFilesPolicyType,
    validators: {
      onSubmit: ZFilesPolicy,
    },
    onSubmit: async ({ value }) =>
      policy &&
      (await mutate(
        {
          ...policy,
          files: value,
        },
        {
          onSuccess: () => form.reset(),
        },
      )),
  });

  return form;
}
