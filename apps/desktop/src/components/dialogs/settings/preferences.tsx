import { languageCodes, languages } from "@config/language";
import { useUpdatePreferencesForm } from "@desktop/hooks/forms/use-update-preferences-form";
import { usePreferencesSettingsDialog } from "@desktop/hooks/state/use-preferences-settings-dialog";
import { useAppTranslation } from "@hooks/use-app-translation";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@ui/dialog";
import { MonitorIcon, MoonIcon, SunIcon } from "lucide-react";

export function PreferencesSettingsDialog() {
  const { t } = useAppTranslation("settings.preferences");
  const { isOpen, setIsOpen } = usePreferencesSettingsDialog();

  const form = useUpdatePreferencesForm();

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="w-90">
        <DialogTitle>{t("title")}</DialogTitle>
        <DialogDescription className="sr-only">
          {t("description")}
        </DialogDescription>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            form.handleSubmit(e);
          }}
          className="mt-8 flex flex-col gap-6"
        >
          <form.AppField name="theme">
            {(field) => (
              <field.Select
                label={{ title: t("theme.label") }}
                placeholder={t("theme.description")}
                items={[
                  {
                    value: "light",
                    label: (
                      <div className="flex items-center gap-2">
                        <SunIcon className="size-4" /> {t("theme.items.light")}
                      </div>
                    ),
                  },
                  {
                    value: "dark",
                    label: (
                      <div className="flex items-center gap-2">
                        <MoonIcon className="size-4" />
                        {t("theme.items.dark")}
                      </div>
                    ),
                  },
                  {
                    value: "system",
                    label: (
                      <div className="flex items-center gap-2">
                        <MonitorIcon className="size-4" />
                        {t("theme.items.system")}
                      </div>
                    ),
                  },
                ]}
              />
            )}
          </form.AppField>
          <form.AppField name="language">
            {(field) => (
              <field.Select
                label={{ title: t("language.label") }}
                placeholder={t("language.description")}
                items={languageCodes.map((code) => ({
                  value: code,
                  label: languages[code].name,
                }))}
              />
            )}
          </form.AppField>
          <form.AppForm>
            <form.Submit>{t("submit")}</form.Submit>
          </form.AppForm>
        </form>
      </DialogContent>
    </Dialog>
  );
}
