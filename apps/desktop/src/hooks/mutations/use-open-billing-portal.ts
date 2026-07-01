import { useAppTranslation } from "@blinkdisk/hooks/use-app-translation";
import { useQueryKey } from "@desktop/hooks/use-query-key";
import { trpc } from "@desktop/lib/trpc";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

export function useOpenBillingPortal() {
  const { t } = useAppTranslation("subscription.portal");
  const queryClient = useQueryClient();
  const { queryKeys } = useQueryKey();

  return useMutation({
    mutationKey: ["payment", "billing", "portal"],
    mutationFn: async () => {
      await new Promise<void>((resolve) => {
        const promise = async () => {
          const res = await trpc.payment.portal.query();
          window.electron.shell.open.browser(res.url);
          resolve();
        };

        toast.promise(promise(), {
          loading: t("loading.title"),
          description: t("loading.description"),
          success: () => ({
            message: t("success.title"),
            description: t("success.description"),
          }),
          error: () => ({
            message: t("error.title"),
            description: t("error.description"),
          }),
        });
      });
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: queryKeys.billing.all,
      });
    },
  });
}
