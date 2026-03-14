import { useAppForm } from "@blinkdisk/forms/use-app-form";
import { ZChangePlanForm } from "@blinkdisk/schemas/payment";
import { useChangePlan } from "@desktop/hooks/mutations/use-change-plan";

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
