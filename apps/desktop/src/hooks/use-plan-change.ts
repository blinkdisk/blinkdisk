import { useUpgradeDialog } from "@desktop/hooks/state/use-upgrade-dialog";
import { useQueryKey } from "@desktop/hooks/use-query-key";
import { queryClient } from "@desktop/routes/__root";
import { useAppTranslation } from "@hooks/use-app-translation";
import { useCallback } from "react";
import { toast } from "sonner";

export function usePlanChange() {
  const { t } = useAppTranslation("subscription.planChangeToast");
  const { queryKeys } = useQueryKey();
  const { setIsOpen } = useUpgradeDialog();

  const onPlanChange = useCallback(
    async (type: "CHANGE" | "START" = "START") => {
      setIsOpen(false);

      await Promise.all([
        queryClient.invalidateQueries({
          predicate: (query) => {
            const key = query.queryKey;

            return (
              Array.isArray(key) &&
              key.length >= 4 &&
              key[0] === queryKeys.vault.all[0] &&
              key[1] === queryKeys.vault.all[1] &&
              key[3] === "space"
            );
          },
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
    },
    [setIsOpen, queryKeys, t],
  );

  return { onPlanChange };
}
