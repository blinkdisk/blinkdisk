import { ZUpdateAccountType } from "@blinkdisk/schemas/accounts";
import { showErrorToast } from "@blinkdisk/utils/error-toast";
import { useQueryKey } from "@desktop/hooks/use-query-key";
import { useMutation, useQueryClient } from "@tanstack/react-query";

export function useUpdateAccount(onSuccess: () => void) {
  const queryClient = useQueryClient();
  const { queryKeys } = useQueryKey();

  return useMutation({
    mutationKey: ["account", "details"],
    mutationFn: async (values: ZUpdateAccountType) => {
      const { data, error } = await window.electron.auth.user.update(values);

      if (error) throw error;
      return data;
    },
    onError: showErrorToast,
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: queryKeys.account.detail(),
      });

      onSuccess?.();
    },
  });
}
