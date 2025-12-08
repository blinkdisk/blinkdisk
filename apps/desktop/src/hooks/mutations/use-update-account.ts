import { useQueryKey } from "@desktop/hooks/use-query-key";
import { authClient } from "@desktop/lib/auth";
import { showErrorToast } from "@desktop/lib/error";
import { ZUpdateUserType } from "@schemas/settings";
import { useMutation, useQueryClient } from "@tanstack/react-query";

export function useUpdateAccount(onSuccess: () => void) {
  const queryClient = useQueryClient();
  const { queryKeys } = useQueryKey();

  return useMutation({
    mutationKey: ["account", "details"],
    mutationFn: async (values: ZUpdateUserType) => {
      const { data, error } = await authClient.updateUser({
        name: `${values.firstName.replace(/\s+/g, "")} ${values.lastName.replace(
          /\s+/g,
          "",
        )}`,
      });

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
