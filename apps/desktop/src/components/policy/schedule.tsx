import { Cron } from "@desktop/components/cron";
import {
  PolicyCategoryProps,
  SettingsCategory,
} from "@desktop/components/policy/category";
import { usePolicyScheduleForm } from "@desktop/hooks/forms/use-policy-schedule-form";
import {
  FormDisabledContext,
  useFieldContext,
  useStore,
} from "@hooks/use-app-form";
import { useAppTranslation } from "@hooks/use-app-translation";
import { ZPolicyLevelType } from "@schemas/policy";
import { Button } from "@ui/button";
import { LabelContainer } from "@ui/label";
import { ClockIcon, PlusIcon, TrashIcon } from "lucide-react";
import { useContext } from "react";

export function ScheduleSettings({ context }: PolicyCategoryProps) {
  const { t } = useAppTranslation("policy.schedule");

  const form = usePolicyScheduleForm(context);

  const isDirty = useStore(form.store, (state) => state.isDirty);
  const trigger = useStore(form.store, (state) => state.values.trigger);

  return (
    <SettingsCategory
      id="schedule"
      title={t("title")}
      description={t("description")}
      icon={<ClockIcon />}
      context={context}
    >
      <form
        onSubmit={(e) => {
          e.preventDefault();
          form.handleSubmit(e);
        }}
        className="flex flex-col gap-4"
      >
        <form.AppField name="trigger">
          {(field) => (
            <field.Tabs
              label={{ title: t("trigger.label") }}
              className="w-full"
              items={[
                {
                  value: "SCHEDULE",
                  label: t("trigger.items.SCHEDULE"),
                },
                {
                  value: "MANUAL",
                  label: t("trigger.items.MANUAL"),
                },
              ]}
            />
          )}
        </form.AppField>
        {trigger === "SCHEDULE" ? (
          <>
            <form.AppField name="interval">
              {(field) => (
                <field.Select
                  label={{ title: t("interval.label") }}
                  placeholder={t("interval.placeholder")}
                  items={[
                    {
                      value: "NONE",
                      label: t("interval.items.NONE"),
                    },
                    {
                      value: String(60 * 10),
                      label: t("interval.items.10_MINUTES"),
                    },
                    {
                      value: String(60 * 15),
                      label: t("interval.items.15_MINUTES"),
                    },
                    {
                      value: String(60 * 20),
                      label: t("interval.items.20_MINUTES"),
                    },
                    {
                      value: String(60 * 30),
                      label: t("interval.items.30_MINUTES"),
                    },
                    {
                      value: String(60 * 60),
                      label: t("interval.items.1_HOUR"),
                    },
                    {
                      value: String(60 * 60 * 3),
                      label: t("interval.items.3_HOURS"),
                    },
                    {
                      value: String(60 * 60 * 6),
                      label: t("interval.items.6_HOURS"),
                    },
                    {
                      value: String(60 * 60 * 12),
                      label: t("interval.items.12_HOURS"),
                    },
                    {
                      value: String(60 * 60 * 24),
                      label: t("interval.items.24_HOURS"),
                    },
                  ]}
                />
              )}
            </form.AppField>
            <form.AppField name="cron" mode="array">
              {() => (
                <CronEditor
                  form={form}
                  label={t("cron.label")}
                  level={context.level}
                />
              )}
            </form.AppField>
          </>
        ) : null}
        <form.AppForm>
          <form.Submit className="mt-2" disabled={!isDirty}>
            {t("save")}
          </form.Submit>
        </form.AppForm>
      </form>
    </SettingsCategory>
  );
}

type CronEditorProps = {
  form: ReturnType<typeof usePolicyScheduleForm>;
  label: string;
  level: ZPolicyLevelType;
};

function CronEditor({ label, form, level }: CronEditorProps) {
  const { t } = useAppTranslation("policy.schedule");

  const disabledContext = useContext(FormDisabledContext);

  const field = useFieldContext<
    { id: string; expression: string; level: ZPolicyLevelType }[] | undefined
  >();

  const value = useStore(field.store, (state) => state.value);

  return (
    <LabelContainer title={label}>
      {value && value.length > 0 ? (
        <div className="mb-2 mt-1 flex flex-col gap-3">
          {value.map((cron, index) => (
            <form.Field key={cron.id} name={`cron[${index}].expression`}>
              {(subField) => (
                <div className="flex w-full flex-col gap-3">
                  {index !== 0 ? <hr className="w-full" /> : null}
                  <div className="flex w-full items-start justify-between gap-2">
                    <Cron
                      value={cron.expression}
                      setValue={(to) => {
                        const current = value?.find((v) => v.id === cron.id);
                        if (current && current.expression === to) return;
                        subField.handleChange(to);
                      }}
                      readOnly={cron.level !== level}
                      disabled={disabledContext}
                    />
                    <Button
                      variant="outline"
                      type="button"
                      size="icon-sm"
                      className="shrink-0"
                      onClick={() => {
                        field.removeValue(index);
                      }}
                      disabled={disabledContext || cron.level !== level}
                    >
                      <TrashIcon />
                    </Button>
                  </div>
                </div>
              )}
            </form.Field>
          ))}
        </div>
      ) : null}
      <Button
        variant="outline"
        type="button"
        onClick={() => {
          field.pushValue({
            id: Math.random().toString(16),
            expression: "0 0 * * *",
            level,
          });
        }}
        disabled={disabledContext}
      >
        <PlusIcon />
        {t("cron.add")}
      </Button>
    </LabelContainer>
  );
}
