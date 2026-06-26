import { useAppTranslation } from "@blinkdisk/hooks/use-app-translation";
import { Alert, AlertDescription, AlertTitle } from "@blinkdisk/ui/alert";
import { SettingsCategory } from "@desktop/components/policy/category";
import { PolicyField } from "@desktop/components/policy/field";
import type { PolicyForm } from "@desktop/hooks/forms/use-policy-form";
import { InfoIcon } from "lucide-react";

export function RetentionSettings({ form }: { form: PolicyForm }) {
  const { t } = useAppTranslation("policy.retention");

  return (
    <SettingsCategory
      id="retention"
      title={t("title")}
      description={t("description")}
    >
      <div className="flex flex-col gap-4">
        <form.AppField name="retention.latest">
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
        <form.AppField name="retention.hourly">
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
        <form.AppField name="retention.daily">
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
        <form.AppField name="retention.weekly">
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
        <form.AppField name="retention.monthly">
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
        <form.AppField name="retention.annual">
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
      </div>
    </SettingsCategory>
  );
}
