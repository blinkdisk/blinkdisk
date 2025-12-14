import { LanguageCode } from "@config/language";
import { useUpdatePreferences } from "@desktop/hooks/mutations/use-update-preferences";
import { useTheme } from "@desktop/hooks/use-theme";
import i18n from "@desktop/i18n";
import { useAppForm } from "@hooks/use-app-form";
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
    listeners: {
      onChange: ({ formApi }) => {
        if (formApi.state.isValid) formApi.handleSubmit();
      },
    },
    onSubmit: async ({ value }) => await mutateAsync(value),
  });

  return form;
}
