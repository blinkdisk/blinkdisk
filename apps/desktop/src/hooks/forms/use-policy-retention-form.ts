import { PolicyContext } from "@desktop/hooks/use-policy-context";
import { useAppForm } from "@hooks/use-app-form";
import { ZRetentionPolicy, ZRetentionPolicyType } from "@schemas/policy";

export function usePolicyRetentionForm({ policy, mutate }: PolicyContext) {
  const form = useAppForm({
    defaultValues: policy?.retention as ZRetentionPolicyType,
    validators: {
      onSubmit: ZRetentionPolicy,
    },
    onSubmit: async ({ value }) =>
      policy &&
      (await mutate(
        {
          ...policy,
          retention: value,
        },
        {
          onSuccess: () => form.reset(),
        },
      )),
  });

  return form;
}
