import { useAppTranslation } from "@blinkdisk/hooks/use-app-translation";
import { showErrorToast } from "@blinkdisk/utils/error-toast";
import { useAccountId } from "@desktop/hooks/use-account-id";
import { useQueryKey } from "@desktop/hooks/use-query-key";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

export function useSync() {
  const { t } = useAppTranslation("vault.syncedToast");
  const { accountId } = useAccountId();
  const queryClient = useQueryClient();
  const { queryKeys } = useQueryKey();

  return useMutation({
    mutationKey: ["sync"],
    mutationFn: async () => {
      if (!accountId) return;
      await window.electron.sync.account(accountId);
    },
    onError: showErrorToast,
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: queryKeys.account.detail(accountId),
        }),
        queryClient.invalidateQueries({
          queryKey: queryKeys.space,
        }),
        queryClient.invalidateQueries({
          queryKey: queryKeys.vault.all,
        }),
      ]);

      toast.success(t("title"), {
        description: t("description"),
      });
    },
  });
}
