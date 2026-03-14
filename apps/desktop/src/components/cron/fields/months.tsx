// Modified from react-js-cron (MIT licensed)
// Original copyright (c) 2021 Xavier Rutayisire
// https://github.com/xrutayisire/react-js-cron

import { CustomSelect } from "@desktop/components/cron/fields/select";
import { UNITS } from "../constants";
import { DEFAULT_LOCALE_EN } from "../locale";
import { MonthsProps } from "../types";

export function Months(props: MonthsProps) {
  const {
    value,
    setValue,
    locale,
    className,
    humanizeLabels,
    disabled,
    readOnly,
    period,
    periodicityOnDoubleClick,
    mode,
    allowClear,
    filterOption,
    getPopupContainer,
  } = props;
  const optionsList = locale.months || DEFAULT_LOCALE_EN.months;

  return (
    <div className="flex items-center gap-2">
      {locale.prefixMonths !== "" && (
        <span>{locale.prefixMonths || DEFAULT_LOCALE_EN.prefixMonths}</span>
      )}

      <CustomSelect
        placeholder={locale.emptyMonths || DEFAULT_LOCALE_EN.emptyMonths}
        optionsList={optionsList}
        grid={false}
        value={value}
        unit={{
          ...UNITS[3]!,
          // Allow translation of alternative labels when using "humanizeLabels"
          // Issue #3
          alt: locale.altMonths || DEFAULT_LOCALE_EN.altMonths,
        }}
        setValue={setValue}
        locale={locale}
        className={className}
        humanizeLabels={humanizeLabels}
        disabled={disabled}
        readOnly={readOnly}
        period={period}
        periodicityOnDoubleClick={periodicityOnDoubleClick}
        mode={mode}
        allowClear={allowClear}
        filterOption={filterOption}
        getPopupContainer={getPopupContainer}
      />
    </div>
  );
}
