import { SettingsCategory } from "@desktop/components/policy/category";
import { PolicyField } from "@desktop/components/policy/field";
import { usePolicyRetentionForm } from "@desktop/hooks/forms/use-policy-retention-form";
import { useStore } from "@hooks/use-app-form";
import { useAppTranslation } from "@hooks/use-app-translation";
import { Alert, AlertDescription, AlertTitle } from "@ui/alert";
import { ArchiveIcon, InfoIcon } from "lucide-react";

export function RetentionSettings() {
  const { t } = useAppTranslation("policy.retention");

  const form = usePolicyRetentionForm();
  const isDirty = useStore(form.store, (state) => state.isDirty);

  return (
    <SettingsCategory
      id="retention"
      title={t("title")}
      description={t("description")}
      icon={<ArchiveIcon />}
    >
      <form
        onSubmit={(e) => {
          e.preventDefault();
          form.handleSubmit(e);
        }}
        className="flex flex-col gap-4"
      >
        <form.AppField name="latest">
          {(field) => (
            <PolicyField>
              <field.Counter
                label={{
                  title: t("latest.label"),
                  description: t("latest.description"),
                }}
              />
            </PolicyField>
          )}
        </form.AppField>
        <form.AppField name="hourly">
          {(field) => (
            <PolicyField>
              <field.Counter
                label={{
                  title: t("hourly.label"),
                  description: t("hourly.description"),
                }}
              />
            </PolicyField>
          )}
        </form.AppField>
        <form.AppField name="daily">
          {(field) => (
            <PolicyField>
              <field.Counter
                label={{
                  title: t("daily.label"),
                  description: t("daily.description"),
                }}
              />
            </PolicyField>
          )}
        </form.AppField>
        <form.AppField name="weekly">
          {(field) => (
            <PolicyField>
              <field.Counter
                label={{
                  title: t("weekly.label"),
                  description: t("weekly.description"),
                }}
              />
            </PolicyField>
          )}
        </form.AppField>
        <form.AppField name="monthly">
          {(field) => (
            <PolicyField>
              <field.Counter
                label={{
                  title: t("monthly.label"),
                  description: t("monthly.description"),
                }}
              />
            </PolicyField>
          )}
        </form.AppField>
        <form.AppField name="annual">
          {(field) => (
            <PolicyField>
              <field.Counter
                label={{
                  title: t("annual.label"),
                  description: t("annual.description"),
                }}
              />
            </PolicyField>
          )}
        </form.AppField>
        <Alert variant="info">
          <InfoIcon />
          <AlertTitle>{t("info.title")}</AlertTitle>
          <AlertDescription className="text-xs">
            {t("info.description")}
          </AlertDescription>
        </Alert>
        <form.AppForm>
          <form.Submit className="mt-2" disabled={!isDirty}>
            {t("save")}
          </form.Submit>
        </form.AppForm>
      </form>
    </SettingsCategory>
  );
}
