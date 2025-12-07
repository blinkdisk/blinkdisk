import { SettingsCategory } from "@desktop/components/policy/category";
import { usePolicyRetentionForm } from "@desktop/hooks/forms/use-policy-retention-form";
import { useStore } from "@hooks/use-app-form";
import { useAppTranslation } from "@hooks/use-app-translation";
import { ZPolicyLevelType } from "@schemas/policy";
import { Alert, AlertDescription, AlertTitle } from "@ui/alert";
import { ArchiveIcon, InfoIcon } from "lucide-react";

type RetentionSettingsProps = {
  level: ZPolicyLevelType;
  folderId?: string;
};

export function RetentionSettings({ level, folderId }: RetentionSettingsProps) {
  const { t } = useAppTranslation("policy.retention");

  const form = usePolicyRetentionForm({ level, folderId });
  const isDirty = useStore(form.store, (state) => state.isDirty);

  return (
    <SettingsCategory
      id="retention"
      title={t("title")}
      description={t("description")}
      icon={<ArchiveIcon />}
      folderId={folderId}
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
            <field.Counter
              label={{
                title: t("latest.label"),
                description: t("latest.description"),
              }}
            />
          )}
        </form.AppField>
        <form.AppField name="hourly">
          {(field) => (
            <field.Counter
              label={{
                title: t("hourly.label"),
                description: t("hourly.description"),
              }}
            />
          )}
        </form.AppField>
        <form.AppField name="daily">
          {(field) => (
            <field.Counter
              label={{
                title: t("daily.label"),
                description: t("daily.description"),
              }}
            />
          )}
        </form.AppField>
        <form.AppField name="weekly">
          {(field) => (
            <field.Counter
              label={{
                title: t("weekly.label"),
                description: t("weekly.description"),
              }}
            />
          )}
        </form.AppField>
        <form.AppField name="monthly">
          {(field) => (
            <field.Counter
              label={{
                title: t("monthly.label"),
                description: t("monthly.description"),
              }}
            />
          )}
        </form.AppField>
        <form.AppField name="annual">
          {(field) => (
            <field.Counter
              label={{
                title: t("annual.label"),
                description: t("annual.description"),
              }}
            />
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
