import { useUpgradeDialog } from "@desktop/hooks/state/use-upgrade-dialog";
import { useAccountId } from "@desktop/hooks/use-account-id";
import { queryClient } from "@desktop/routes/__root";
import { useAppTranslation } from "@hooks/use-app-translation";
import { useCallback } from "react";
import { toast } from "sonner";

export function usePlanChange() {
  const { t } = useAppTranslation("subscription.planChangeToast");
  const { accountId } = useAccountId();
  const { setIsOpen } = useUpgradeDialog();

  const onPlanChange = useCallback(
    async (type: "CHANGE" | "START" = "START") => {
      setIsOpen(false);

      await queryClient.invalidateQueries({
        predicate: (query) =>
          (query.queryKey[0] === accountId &&
            query.queryKey[1] === "vault" &&
            query.queryKey[3] === "space") ||
          (query.queryKey[0] === accountId &&
            query.queryKey[1] === "subscription") ||
          (query.queryKey[0] === accountId && query.queryKey[1] === "billing"),
      });

      toast.success(t(`${type}.title`), {
        description: t(`${type}.description`),
        duration: 60000,
      });
    },
    [setIsOpen, accountId, t],
  );

  return { onPlanChange };
}
