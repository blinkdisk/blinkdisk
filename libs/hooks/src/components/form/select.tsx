import { FormDisabledContext, useFieldContext } from "@hooks/use-app-form";
import { LabelContainer, LabelContainerProps } from "@ui/label";
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
  SelectProps & { label: LabelContainerProps } & {
    placeholder?: string;
    items: { value: string; label: ReactNode }[];
    triggerClassName?: string;
    contentClassName?: string;
  }
>(
  (
    { triggerClassName, contentClassName, label, placeholder, items, disabled, ...props },
    ref,
  ) => {
    const field = useFieldContext<string>();
    const disabledContext = useContext(FormDisabledContext);

    return (
      <LabelContainer
        {...label}
        errors={field.state.meta.errors}
        name={field.name}
      >
        <SelectRoot
          {...props}
          onValueChange={(value) => field.setValue(value)}
          value={field.state.value}
          disabled={disabledContext || disabled}
        >
          <SelectTrigger ref={ref} className={triggerClassName}>
            <SelectValue placeholder={placeholder} />
          </SelectTrigger>
          <SelectContent className={contentClassName}>
            {items.map((item) => (
              <SelectItem key={item.value} id={item.value} value={item.value}>
                {item.label}
              </SelectItem>
            ))}
          </SelectContent>
        </SelectRoot>
      </LabelContainer>
    );
  },
);

Select.displayName = "Select";

export { Select };
