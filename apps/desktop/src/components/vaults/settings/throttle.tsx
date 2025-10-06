import { SettingsCategory } from "@desktop/components/policy/category";
import { useUpdateThrottleForm } from "@desktop/hooks/forms/use-update-throttle-form";
import { FormDisabledContext, useStore } from "@hooks/use-app-form";
import { useAppTranslation } from "@hooks/use-app-translation";
import { GaugeIcon } from "lucide-react";

export function VaultThrottleSettings() {
  const { t } = useAppTranslation("settings.vault.throttle");

  const form = useUpdateThrottleForm();

  const values = useStore(form.store, (state) => state.values);
  const isDirty = useStore(form.store, (state) => state.isDirty);

  return (
    <SettingsCategory
      id="throttle"
      title={t("title")}
      description={t("description")}
      icon={<GaugeIcon />}
    >
      <FormDisabledContext.Provider value={false}>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            form.handleSubmit(e);
          }}
          className="flex flex-col gap-4"
        >
          <form.AppField name="upload.enabled">
            {(field) => (
              <field.Switch
                label={{
                  title: t("upload.enabled.label"),
                }}
              />
            )}
          </form.AppField>
          {values?.upload?.enabled ? (
            <form.AppField name="upload.limit">
              {(field) => (
                <field.Bandwith
                  label={{
                    title: t("upload.limit.label"),
                    description: t("upload.limit.description"),
                  }}
                />
              )}
            </form.AppField>
          ) : null}
          <form.AppField name="download.enabled">
            {(field) => (
              <field.Switch
                label={{
                  title: t("download.enabled.label"),
                }}
              />
            )}
          </form.AppField>
          {values?.download?.enabled ? (
            <form.AppField name="download.limit">
              {(field) => (
                <field.Bandwith
                  label={{
                    title: t("download.limit.label"),
                    description: t("download.limit.description"),
                  }}
                />
              )}
            </form.AppField>
          ) : null}
          <form.AppForm>
            <form.Submit disabled={!isDirty}>{t("save")}</form.Submit>
          </form.AppForm>
        </form>
      </FormDisabledContext.Provider>
    </SettingsCategory>
  );
}
