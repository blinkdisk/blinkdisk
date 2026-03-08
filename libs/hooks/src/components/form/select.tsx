import { FormDisabledContext, useFieldContext } from "@hooks/use-app-form";
import { DynamicField, DynamicFieldProps } from "@ui/dynamic-field";
import {
  SelectContent,
  SelectItem,
  SelectProps,
  Select as SelectRoot,
  SelectTrigger,
  SelectValue,
} from "@ui/select";
import React, { ReactNode, useContext } from "react";

const Select = React.forwardRef<
  HTMLButtonElement,
  SelectProps<{ value: string; label: ReactNode }> & {
    label: DynamicFieldProps;
  } & {
    placeholder?: string;
    items: { value: string; label: ReactNode }[];
    triggerClassName?: string;
    contentClassName?: string;
  }
>(
  (
    {
      triggerClassName,
      contentClassName,
      label,
      placeholder,
      items,
      disabled,
      ...props
    },
    ref,
  ) => {
    const field = useFieldContext<string | undefined>();
    const disabledContext = useContext(FormDisabledContext);

    return (
      <DynamicField
        {...label}
        errors={field.state.meta.errors}
        name={field.name}
      >
        <SelectRoot
          {...props}
          onValueChange={(value) => field.setValue(value?.value)}
          value={items.find((item) => item.value === field.state.value)}
          disabled={disabledContext || disabled}
        >
          <SelectTrigger ref={ref} className={triggerClassName}>
            <SelectValue placeholder={placeholder} />
          </SelectTrigger>
          <SelectContent className={contentClassName}>
            {items.map((item) => (
              <SelectItem key={item.value} value={item.value}>
                {item.label}
              </SelectItem>
            ))}
          </SelectContent>
        </SelectRoot>
      </DynamicField>
    );
  },
);

Select.displayName = "Select";

export { Select };
