import i18n from "@desktop/i18n";
import { authClient } from "@desktop/lib/auth";
import { showErrorToast } from "@desktop/lib/error";
import { useAppTranslation } from "@hooks/use-app-translation";
import { useTheme } from "@hooks/use-theme";
import { ZUpdatePreferencesType } from "@schemas/settings";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

export function useUpdatePreferences(onSuccess: () => void) {
  const { t } = useAppTranslation("settings.preferences");
  const { setTheme } = useTheme();
  const queryClient = useQueryClient();

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
        queryKey: ["account"],
      });

      toast.success(t("success.title"), {
        description: t("success.description"),
      });

      onSuccess?.();
    },
  });
}
