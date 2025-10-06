import { trpc } from "@desktop/lib/trpc";
import { useAppTranslation } from "@hooks/use-app-translation";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";

export function useOpenBillingPortal() {
  const { t } = useAppTranslation("subscription.portal");

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
  });
}
