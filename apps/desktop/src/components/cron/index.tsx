import { useAppTranslation } from "@blinkdisk/hooks/use-app-translation";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@blinkdisk/ui/select";
import { cn } from "@blinkdisk/utils/class";
import { CRON_UNITS, PERIODS } from "@desktop/components/cron/constants";
import {
  formatCronExpression,
  formatCronValue,
  parseCronExpression,
} from "@desktop/components/cron/converter";
import { resolveCronLocale } from "@desktop/components/cron/locale";
import type {
  ClockFormat,
  CronField,
  CronLocale,
  CronProps,
  CronSchedule,
  CronUnit,
  Period,
  ResolvedCronLocale,
} from "@desktop/components/cron/types";

const CLOCK_FORMAT_SAMPLE_DATE = new Date(Date.UTC(2020, 0, 1, 13, 0, 0));
const CLOCK_FORMAT = /AM|PM/i.test(
  new Intl.DateTimeFormat(undefined, {
    hour: "numeric",
    hour12: undefined,
  }).format(CLOCK_FORMAT_SAMPLE_DATE),
)
  ? "12-hour-clock"
  : "24-hour-clock";

const DEFAULT_SCHEDULE: CronSchedule = {
  period: "day",
  minutes: [0],
  hours: [0],
  monthDays: [],
  months: [],
  weekDays: [],
};

const PERIOD_DEFAULTS = {
  year: {
    months: [1],
    monthDays: [1],
    weekDays: [],
    hours: [0],
    minutes: [0],
  },
  month: {
    months: [],
    monthDays: [1],
    weekDays: [],
    hours: [0],
    minutes: [0],
  },
  week: {
    months: [],
    monthDays: [],
    weekDays: [0],
    hours: [0],
    minutes: [0],
  },
  day: {
    months: [],
    monthDays: [],
    weekDays: [],
    hours: [0],
    minutes: [0],
  },
  hour: {
    months: [],
    monthDays: [],
    weekDays: [],
    hours: [],
    minutes: [0],
  },
  minute: {
    months: [],
    monthDays: [],
    weekDays: [],
    hours: [],
    minutes: [],
  },
} satisfies Record<Period, Omit<CronSchedule, "period">>;

const PERIOD_LABELS = {
  year: "yearOption",
  month: "monthOption",
  week: "weekOption",
  day: "dayOption",
  hour: "hourOption",
  minute: "minuteOption",
} as const satisfies Record<Period, keyof ResolvedCronLocale>;

type CronFieldConfig = {
  field: CronField;
  unit: CronUnit;
  prefix: string;
  placeholder: string;
  labels?: readonly string[];
  suffix?: string;
};

type SelectOption = {
  value: string;
  label: string;
};

export function Cron({
  value,
  setValue,
  disabled = false,
  className,
}: CronProps) {
  const { t } = useAppTranslation("cron");
  const locale = resolveCronLocale(
    t("component", { returnObjects: true }) as unknown as CronLocale,
  );
  const schedule = parseCronExpression(value) ?? DEFAULT_SCHEDULE;

  const commitSchedule = (nextSchedule: CronSchedule) => {
    const nextValue = formatCronExpression(nextSchedule);
    if (nextValue !== value) {
      setValue(nextValue, { selectedPeriod: nextSchedule.period });
    }
  };

  const updatePeriod = (period: Period) => {
    commitSchedule(applyPeriodDefaults(schedule, period));
  };

  const updateField = (field: CronField, unit: CronUnit, values: string[]) => {
    const selectedValues =
      values.length === getUnitSize(unit) ? [] : values.map(Number);

    commitSchedule({
      ...schedule,
      [field]: selectedValues,
    });
  };

  const fields = getVisibleFields(schedule, locale);

  return (
    <div className={cn("flex flex-wrap items-center gap-2", className)}>
      {locale.prefixPeriod !== "" ? <span>{locale.prefixPeriod}</span> : null}

      <PeriodSelect
        value={schedule.period}
        locale={locale}
        disabled={disabled}
        placeholder={t("placeholders.period")}
        onChange={updatePeriod}
      />

      {fields.map((field) => (
        <CronFieldSelect
          key={field.field}
          config={field}
          value={schedule[field.field]}
          disabled={disabled}
          clockFormat={CLOCK_FORMAT}
          onChange={(nextValue) =>
            updateField(field.field, field.unit, nextValue)
          }
        />
      ))}
    </div>
  );
}

function PeriodSelect({
  value,
  locale,
  disabled,
  placeholder,
  onChange,
}: {
  value: Period;
  locale: ResolvedCronLocale;
  disabled: boolean;
  placeholder: string;
  onChange: (period: Period) => void;
}) {
  const options = PERIODS.map((period) => ({
    value: period,
    label: locale[PERIOD_LABELS[period]],
  }));

  return (
    <Select
      items={options}
      value={value}
      onValueChange={(nextValue) => {
        if (nextValue) onChange(nextValue);
      }}
      disabled={disabled}
    >
      <SelectTrigger className="h-10 w-auto min-w-28 gap-1 text-xs">
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent>
        {options.map((option) => (
          <SelectItem key={option.value} value={option.value}>
            {option.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

function CronFieldSelect({
  config,
  value,
  disabled,
  clockFormat,
  onChange,
}: {
  config: CronFieldConfig;
  value: number[];
  disabled: boolean;
  clockFormat: ClockFormat;
  onChange: (value: string[]) => void;
}) {
  const options = getOptions(config.unit, config.labels, clockFormat);

  return (
    <div className="flex items-center gap-2">
      {config.prefix !== "" ? <span>{config.prefix}</span> : null}
      <Select
        items={options}
        value={value.map(String)}
        onValueChange={onChange}
        disabled={disabled}
        multiple
      >
        <SelectTrigger className="h-10 w-auto min-w-28 gap-1 text-xs">
          <SelectValue placeholder={config.placeholder} />
        </SelectTrigger>
        <SelectContent>
          {options.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      {config.suffix ? <span>{config.suffix}</span> : null}
    </div>
  );
}

function getVisibleFields(
  schedule: CronSchedule,
  locale: ResolvedCronLocale,
): CronFieldConfig[] {
  const fields: CronFieldConfig[] = [];

  if (schedule.period === "year") {
    fields.push({
      field: "months",
      unit: CRON_UNITS.months,
      prefix: locale.prefixMonths,
      placeholder: locale.emptyMonths,
      labels: locale.months,
    });
  }

  if (schedule.period === "year" || schedule.period === "month") {
    fields.push({
      field: "monthDays",
      unit: CRON_UNITS.monthDays,
      prefix: locale.prefixMonthDays,
      placeholder: locale.emptyMonthDays,
    });
  }

  if (
    schedule.period === "year" ||
    schedule.period === "month" ||
    schedule.period === "week"
  ) {
    fields.push({
      field: "weekDays",
      unit: CRON_UNITS.weekDays,
      prefix:
        schedule.period === "week"
          ? locale.prefixWeekDays
          : locale.prefixWeekDaysForMonthAndYearPeriod,
      placeholder: locale.emptyWeekDays,
      labels: locale.weekDays,
    });
  }

  if (schedule.period !== "minute" && schedule.period !== "hour") {
    fields.push({
      field: "hours",
      unit: CRON_UNITS.hours,
      prefix: locale.prefixHours,
      placeholder: locale.emptyHours,
    });
  }

  if (schedule.period !== "minute") {
    const isHourPeriod = schedule.period === "hour";

    fields.push({
      field: "minutes",
      unit: CRON_UNITS.minutes,
      prefix: isHourPeriod
        ? locale.prefixMinutesForHourPeriod
        : locale.prefixMinutes,
      placeholder: isHourPeriod
        ? locale.emptyMinutesForHourPeriod
        : locale.emptyMinutes,
      suffix: isHourPeriod ? locale.suffixMinutesForHourPeriod : undefined,
    });
  }

  return fields;
}

function getOptions(
  unit: CronUnit,
  labels: readonly string[] | undefined,
  clockFormat: ClockFormat,
) {
  const options: SelectOption[] = [];

  for (let value = unit.min; value <= unit.max; value += 1) {
    options.push({
      value: String(value),
      label: formatCronValue(value, unit, { labels, clockFormat }),
    });
  }

  return options;
}

function applyPeriodDefaults(
  currentSchedule: CronSchedule,
  period: Period,
): CronSchedule {
  const defaults = PERIOD_DEFAULTS[period];

  return {
    period,
    months:
      currentSchedule.months.length > 0
        ? currentSchedule.months
        : defaults.months,
    monthDays:
      currentSchedule.monthDays.length > 0
        ? currentSchedule.monthDays
        : defaults.monthDays,
    weekDays:
      currentSchedule.weekDays.length > 0
        ? currentSchedule.weekDays
        : defaults.weekDays,
    hours:
      currentSchedule.hours.length > 0 ? currentSchedule.hours : defaults.hours,
    minutes:
      currentSchedule.minutes.length > 0
        ? currentSchedule.minutes
        : defaults.minutes,
  };
}

function getUnitSize(unit: CronUnit) {
  return unit.max - unit.min + 1;
}
