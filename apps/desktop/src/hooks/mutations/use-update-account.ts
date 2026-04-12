import { ZUpdateAccountType } from "@blinkdisk/schemas/accounts";
import { CustomError } from "@blinkdisk/utils/error";
import { showErrorToast } from "@blinkdisk/utils/error-toast";
import { useQueryKey } from "@desktop/hooks/use-query-key";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useAccountId } from "../use-account-id";

export function useUpdateAccount(onSuccess: () => void) {
  const queryClient = useQueryClient();
  const { queryKeys } = useQueryKey();
  const { accountId } = useAccountId();

  return useMutation({
    mutationKey: ["account", "details"],
    mutationFn: async (values: ZUpdateAccountType) => {
      if (!accountId) throw new CustomError("MISSING_REQUIRED_VALUE");

      const { data, error } = await window.electron.auth.account.update({
        ...values,
        id: accountId,
      });

      if (error) throw error;
      return data;
    },
    onError: showErrorToast,
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: queryKeys.account.detail(accountId),
      });

      onSuccess?.();
    },
  });
}
