import { PolicyContext } from "@desktop/hooks/use-policy-context";
import { useAppForm } from "@hooks/use-app-form";
import { ZGeneralPolicyForm, ZGeneralPolicyFormType } from "@schemas/policy";

export function usePolicyGeneralForm({ policy, mutate }: PolicyContext) {
  const form = useAppForm({
    defaultValues: {
      name: policy?.name,
      emoji: policy?.emoji,
    } as ZGeneralPolicyFormType,
    validators: {
      onSubmit: ZGeneralPolicyForm,
    },
    onSubmit: async ({ value }) =>
      policy &&
      (await mutate(
        {
          ...policy,
          ...value,
        },
        {
          onSuccess: () => form.reset(),
        },
      )),
  });

  return form;
}
