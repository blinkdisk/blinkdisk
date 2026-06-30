import { DynamicField } from "@blinkdisk/components/dynamic-field";
import {
  FormDisabledContext,
  useFieldContext,
  useStore,
} from "@blinkdisk/forms/use-app-form";
import { useAppTranslation } from "@blinkdisk/hooks/use-app-translation";
import { Button } from "@blinkdisk/ui/button";
import { Cron } from "@desktop/components/cron";
import { SettingsCategory } from "@desktop/components/policy/category";
import { PolicyField } from "@desktop/components/policy/field";
import type { PolicyForm } from "@desktop/hooks/forms/use-policy-form";
import { PlusIcon, TrashIcon } from "lucide-react";
import { use } from "react";

export function ScheduleSettings({
  form,
  showAdvanced = true,
}: {
  form: PolicyForm;
  showAdvanced?: boolean;
}) {
  const { t } = useAppTranslation("policy.schedule");

  const trigger = useStore(
    form.store,
    (state) => state.values.schedule.trigger,
  );

  return (
    <SettingsCategory
      id="schedule"
      title={t("title")}
      description={t("description")}
    >
      <div className="flex flex-col gap-4">
        <form.AppField name="schedule.trigger">
          {(field) => (
            <PolicyField>
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
            </PolicyField>
          )}
        </form.AppField>
        {trigger === "SCHEDULE" ? (
          <>
            <form.AppField name="schedule.interval">
              {(field) => (
                <PolicyField>
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
                </PolicyField>
              )}
            </form.AppField>
            {showAdvanced ? (
              <form.AppField name="schedule.cron" mode="array">
                {() => (
                  <PolicyField>
                    <CronEditor form={form} label={t("cron.label")} />
                  </PolicyField>
                )}
              </form.AppField>
            ) : null}
          </>
        ) : null}
      </div>
    </SettingsCategory>
  );
}

type CronEditorProps = {
  form: PolicyForm;
  label: string;
};

function CronEditor({ label, form }: CronEditorProps) {
  const { t } = useAppTranslation("policy.schedule");

  const disabledContext = use(FormDisabledContext);

  const field = useFieldContext<
    { id: string; expression: string }[] | undefined
  >();

  const value = useStore(field.store, (state) => state.value);
  const addCronExpression = () => {
    field.pushValue({
      id: Math.random().toString(16),
      expression: "0 0 * * *",
    });
  };

  return (
    <DynamicField title={label}>
      {value && value.length > 0 ? (
        <div className="mb-2 mt-1 flex flex-col gap-3">
          {value.map((cron, index) => (
            <form.Field
              key={cron.id}
              name={`schedule.cron[${index}].expression`}
            >
              {(subField) => (
                <div className="flex w-full flex-col gap-3">
                  {index !== 0 ? <hr className="w-full" /> : null}
                  <div className="flex w-full items-center justify-between gap-2">
                    <Cron
                      value={cron.expression}
                      setValue={(to) => {
                        const current = value?.find((v) => v.id === cron.id);
                        if (current && current.expression === to) return;
                        subField.handleChange(to);
                      }}
                      disabled={disabledContext}
                    />
                    <Button
                      variant="secondary"
                      type="button"
                      size="icon-sm"
                      className="shrink-0"
                      onClick={() => {
                        field.removeValue(index);
                      }}
                      disabled={disabledContext}
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
        variant="secondary"
        type="button"
        onClick={addCronExpression}
        disabled={disabledContext}
      >
        <PlusIcon />
        {t("cron.add")}
      </Button>
    </DynamicField>
  );
}
