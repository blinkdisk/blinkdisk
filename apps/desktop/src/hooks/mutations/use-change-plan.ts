import { useQueryKey } from "@desktop/hooks/use-query-key";
import { showErrorToast } from "@desktop/lib/error";
import { trpc } from "@desktop/lib/trpc";
import { ZChangePlan } from "@schemas/payment";
import { useMutation, useQueryClient } from "@tanstack/react-query";

type UseChangePlan = {
  onSuccess?: () => void;
};

export function useChangePlan({ onSuccess }: UseChangePlan = {}) {
  const queryClient = useQueryClient();
  const { queryKeys } = useQueryKey();

  return useMutation({
    mutationKey: ["payment", "plan", "change"],
    mutationFn: async (values: ZChangePlan) => {
      return await trpc.payment.changePlan.mutate({
        priceId: values.priceId,
      });
    },
    onError: showErrorToast,
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: queryKeys.subscription.detail(),
      });

      onSuccess?.();
    },
  });
}
