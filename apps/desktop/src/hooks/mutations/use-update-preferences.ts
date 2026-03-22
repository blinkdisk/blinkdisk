import { ZUpdatePreferencesType } from "@blinkdisk/schemas/settings";
import { showErrorToast } from "@blinkdisk/utils/error-toast";
import { useQueryKey } from "@desktop/hooks/use-query-key";
import { useTheme } from "@desktop/hooks/use-theme";
import { i18n } from "@desktop/i18n";
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

      const { data, error } = await window.electron.auth.user.update({
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
