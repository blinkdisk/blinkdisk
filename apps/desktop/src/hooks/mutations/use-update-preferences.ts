import { useQueryKey } from "#hooks/use-query-key";
import { useTheme } from "#hooks/use-theme";
import i18n from "#i18n";
import { authClient } from "#lib/auth";
import { showErrorToast } from "#lib/error";
import { ZUpdatePreferencesType } from "@blinkdisk/schemas/settings";
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
