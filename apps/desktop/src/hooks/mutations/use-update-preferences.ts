import { ZUpdatePreferencesType } from "@blinkdisk/schemas/settings";
import { showErrorToast } from "@blinkdisk/utils/error-toast";
import { useQueryKey } from "@desktop/hooks/use-query-key";
import { useTheme } from "@desktop/hooks/use-theme";
import { i18n } from "@desktop/i18n";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useAccountId } from "../use-account-id";

export function useUpdatePreferences(onSuccess: () => void) {
  const queryClient = useQueryClient();

  const { setTheme } = useTheme();
  const { queryKeys } = useQueryKey();
  const { isOnlineAccount, accountId } = useAccountId();

  return useMutation({
    mutationKey: ["user", "preferences"],
    mutationFn: async (values: ZUpdatePreferencesType) => {
      setTheme(values.theme);
      i18n.changeLanguage(values.language);

      if (isOnlineAccount && accountId) {
        const { error } = await window.electron.auth.user.update({
          language: values.language,
          id: accountId,
        });

        if (error) throw error;
      }
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
