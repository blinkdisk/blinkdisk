import { PolicyContext } from "@desktop/hooks/use-policy-context";
import { useAppForm } from "@hooks/use-app-form";
import { ZSchedulePolicy, ZSchedulePolicyType } from "@schemas/policy";

export function usePolicyScheduleForm({ policy, mutate }: PolicyContext) {
  const form = useAppForm({
    defaultValues: policy?.schedule as ZSchedulePolicyType,
    validators: {
      onSubmit: ZSchedulePolicy,
    },
    onSubmit: async ({ value }) =>
      policy &&
      (await mutate(
        {
          ...policy,
          schedule: value,
        },
        {
          onSuccess: () => form.reset(),
        },
      )),
  });

  return form;
}
