import { useQueryKey } from "@desktop/hooks/use-query-key";
import i18n from "@desktop/i18n";
import { authClient } from "@desktop/lib/auth";
import { showErrorToast } from "@desktop/lib/error";
import { useTheme } from "@hooks/use-theme";
import { ZUpdatePreferencesType } from "@schemas/settings";
import { useMutation, useQueryClient } from "@tanstack/react-query";

export function useUpdatePreferences(onSuccess: () => void) {
  const { setTheme } = useTheme();
  const queryClient = useQueryClient();
  const { queryKeys } = useQueryKey();

  return useMutation({
    mutationKey: ["user", "preferences"],
    mutationFn: async (values: ZUpdatePreferencesType) => {
      setTheme(values.theme);
      i18n.changeLanguage(values.language);

      const { data, error } = await authClient.updateUser({
        language: values.language,
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
