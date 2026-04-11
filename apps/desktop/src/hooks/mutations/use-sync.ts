import { useAppTranslation } from "@blinkdisk/hooks/use-app-translation";
import { showErrorToast } from "@blinkdisk/utils/error-toast";
import { useAccountId } from "@desktop/hooks/use-account-id";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";

export function useSync() {
  const { t } = useAppTranslation("vault.syncedToast");
  const { accountId } = useAccountId();

  return useMutation({
    mutationKey: ["sync"],
    mutationFn: async () => {
      if (!accountId) return;
      await window.electron.sync.account(accountId);
    },
    onError: showErrorToast,
    onSuccess: () => {
      toast.success(t("title"), {
        description: t("description"),
      });
    },
  });
}
