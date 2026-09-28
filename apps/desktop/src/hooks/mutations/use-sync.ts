import { useAppTranslation } from "@blinkdisk/hooks/use-app-translation";
import { getErrorCode } from "@blinkdisk/utils/error";
import { showErrorToast } from "@blinkdisk/utils/error-toast";
import { useAccountId } from "@desktop/hooks/use-account-id";
import { useMutation } from "@tanstack/react-query";
import { usePostHog } from "posthog-js/react";
import { toast } from "sonner";

export function useSync() {
  const { t } = useAppTranslation("vault.syncedToast");
  const { accountId } = useAccountId();
  const posthog = usePostHog();

  return useMutation({
    mutationKey: ["sync"],
    mutationFn: async () => {
      if (!accountId) return;
      await window.electron.sync.account(accountId);
    },
    onError: (error) => {
      const reason = getErrorCode(error) ?? "ACCOUNT_SYNC_FAILED";
      posthog.capture("account_sync_failed", { source: "manual", reason });
      showErrorToast({ code: reason });
    },
    onSuccess: () => {
      toast.success(t("title"), {
        description: t("description"),
      });
    },
  });
}
