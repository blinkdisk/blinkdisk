import { useAppTranslation } from "@blinkdisk/hooks/use-app-translation";
import { useUpgradeDialog } from "@desktop/hooks/state/use-upgrade-dialog";
import { useQueryKey } from "@desktop/hooks/use-query-key";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

export function usePlanChange() {
  const { t } = useAppTranslation("subscription.planChangeToast");
  const queryClient = useQueryClient();
  const { queryKeys } = useQueryKey();
  const { setIsOpen } = useUpgradeDialog();

  const onPlanChange = async (type: "CHANGE" | "START" = "START") => {
    setIsOpen(false);

    await Promise.all([
      queryClient.invalidateQueries({
        queryKey: queryKeys.space,
      }),
      queryClient.invalidateQueries({
        queryKey: queryKeys.subscription.all,
      }),
      queryClient.invalidateQueries({
        queryKey: queryKeys.billing.all,
      }),
    ]);

    toast.success(t(`${type}.title`), {
      description: t(`${type}.description`),
      duration: 60000,
    });
  };

  return { onPlanChange };
}
