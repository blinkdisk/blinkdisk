import { useChangePlan } from "@desktop/hooks/mutations/use-change-plan";
import { useAppForm } from "@hooks/use-app-form";
import { ZChangePlanForm } from "@schemas/payment";

type UseChangePlan = {
  priceId: string | undefined;
};

export function useChangePlanForm({ priceId }: UseChangePlan) {
  const { mutateAsync } = useChangePlan();

  return useAppForm({
    defaultValues: {
      confirmed: false,
    },
    validators: {
      onSubmit: ZChangePlanForm,
    },
    onSubmit: async () =>
      priceId &&
      (await mutateAsync({
        priceId,
      })),
  });
}
