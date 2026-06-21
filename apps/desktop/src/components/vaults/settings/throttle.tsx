import { FormDisabledContext, useStore } from "@blinkdisk/forms/use-app-form";
import { useAppTranslation } from "@blinkdisk/hooks/use-app-translation";
import {
  SettingsGroup,
  SettingsPanel,
  SettingsRow,
} from "@desktop/components/settings";
import { useUpdateThrottleForm } from "@desktop/hooks/forms/use-update-throttle-form";

export function VaultThrottleSettings() {
  const { t } = useAppTranslation("settings.vault.throttle");

  const form = useUpdateThrottleForm();

  const values = useStore(form.store, (state) => state.values);
  const isDirty = useStore(form.store, (state) => state.isDirty);

  return (
    <SettingsGroup title={t("title")}>
      <FormDisabledContext.Provider value={false}>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            form.handleSubmit(e);
          }}
        >
          <SettingsPanel>
            <SettingsRow
              title={t("upload.enabled.label")}
              description={t("upload.enabled.description")}
            >
              <div className="flex items-center justify-start gap-3 md:justify-end">
                {values?.upload?.enabled ? (
                  <form.AppField name="upload.limit">
                    {(field) => (
                      <field.Bandwith
                        label={{
                          title: t("upload.limit.label"),
                          labelClassName: "sr-only",
                          containerClassName: "w-auto",
                        }}
                      />
                    )}
                  </form.AppField>
                ) : null}
                <form.AppField name="upload.enabled">
                  {(field) => (
                    <field.Switch
                      label={{
                        title: t("upload.enabled.label"),
                        labelClassName: "sr-only",
                        containerClassName: "w-auto",
                      }}
                    />
                  )}
                </form.AppField>
              </div>
            </SettingsRow>
            <SettingsRow
              title={t("download.enabled.label")}
              description={t("download.enabled.description")}
            >
              <div className="flex items-center justify-start gap-3 md:justify-end">
                {values?.download?.enabled ? (
                  <form.AppField name="download.limit">
                    {(field) => (
                      <field.Bandwith
                        label={{
                          title: t("download.limit.label"),
                          labelClassName: "sr-only",
                          containerClassName: "w-auto",
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
                        labelClassName: "sr-only",
                        containerClassName: "w-auto",
                      }}
                    />
                  )}
                </form.AppField>
              </div>
            </SettingsRow>
            <SettingsRow fullWidth>
              <div className="flex justify-end">
                <form.AppForm>
                  <form.Submit className="w-fit" disabled={!isDirty}>
                    {t("save")}
                  </form.Submit>
                </form.AppForm>
              </div>
            </SettingsRow>
          </SettingsPanel>
        </form>
      </FormDisabledContext.Provider>
    </SettingsGroup>
  );
}
