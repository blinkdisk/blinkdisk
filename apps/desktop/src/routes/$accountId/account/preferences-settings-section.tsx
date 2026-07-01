import { LANGUAGE_CODES, LANGUAGE_NAMES } from "@blinkdisk/constants/language";
import { useAppTranslation } from "@blinkdisk/hooks/use-app-translation";
import {
  SettingsGroup,
  SettingsPanel,
  SettingsRow,
} from "@desktop/components/settings";
import { useUpdatePreferencesForm } from "@desktop/hooks/forms/use-update-preferences-form";
import { MonitorIcon, MoonIcon, SunIcon } from "lucide-react";

export function PreferencesSettingsSection() {
  const { t } = useAppTranslation("settings.account.preferences");
  const form = useUpdatePreferencesForm();

  return (
    <SettingsGroup title={t("title")}>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          form.handleSubmit(e);
        }}
      >
        <SettingsPanel>
          <SettingsRow
            title={t("theme.label")}
            description={t("theme.description")}
          >
            <form.AppField name="theme">
              {(field) => (
                <field.Select
                  label={{
                    title: t("theme.label"),
                    labelClassName: "sr-only",
                  }}
                  placeholder={t("theme.description")}
                  triggerClassName="md:w-44"
                  items={[
                    {
                      value: "light",
                      label: (
                        <div className="flex items-center gap-2">
                          <SunIcon className="size-4" />{" "}
                          {t("theme.items.light")}
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
          </SettingsRow>
          <SettingsRow
            title={t("language.label")}
            description={t("language.description")}
          >
            <form.AppField name="language">
              {(field) => (
                <field.Select
                  label={{
                    title: t("language.label"),
                    labelClassName: "sr-only",
                  }}
                  placeholder={t("language.description")}
                  triggerClassName="md:w-44"
                  items={LANGUAGE_CODES.map((code) => ({
                    value: code,
                    label: LANGUAGE_NAMES[code].name,
                  }))}
                />
              )}
            </form.AppField>
          </SettingsRow>
        </SettingsPanel>
      </form>
    </SettingsGroup>
  );
}
