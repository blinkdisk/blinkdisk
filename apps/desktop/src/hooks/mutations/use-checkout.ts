import { showErrorToast } from "@desktop/lib/error";
import { trpc } from "@desktop/lib/trpc";
import { useAppTranslation } from "@hooks/use-app-translation";
import { ZCreateCheckoutType } from "@schemas/payment";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";

type UseCheckoutOptions = {
  onSuccess?: (payload: { url: string }) => void;
};

export function useCheckout({ onSuccess }: UseCheckoutOptions = {}) {
  const { t } = useAppTranslation("subscription.upgradeDialog.checkout.toast");

  return useMutation({
    mutationKey: ["payment", "checkout"],
    mutationFn: async (values: ZCreateCheckoutType) => {
      return await trpc.payment.checkout.mutate({
        priceId: values.priceId,
      });
    },
    onError: showErrorToast,
    onSuccess: async (res) => {
      await window.electron.shell.open.browser(res.url);

      toast.success(t("title"), {
        description: t("description"),
      });

      onSuccess?.({ url: res.url });
    },
  });
}
