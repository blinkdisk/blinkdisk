import { LanguageCode } from "@config/language";
import { useUpdatePreferences } from "@desktop/hooks/mutations/use-update-preferences";
import i18n from "@desktop/i18n";
import { useAppForm } from "@hooks/use-app-form";
import { useTheme } from "@hooks/use-theme";
import { ZUpdatePreferences } from "@schemas/settings";

export function useUpdatePreferencesForm() {
  const { theme } = useTheme();
  const { mutateAsync } = useUpdatePreferences(() => form.reset());

  const form = useAppForm({
    defaultValues: {
      theme: theme,
      language: i18n.language as LanguageCode,
    },
    validators: {
      onSubmit: ZUpdatePreferences,
    },
    onSubmit: async ({ value }) => await mutateAsync(value),
  });

  return form;
}
