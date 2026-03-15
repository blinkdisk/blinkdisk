import {
  DynamicField,
  DynamicFieldProps,
} from "@blinkdisk/components/dynamic-field";
import {
  CheckboxProps,
  Checkbox as CheckboxRoot,
} from "@blinkdisk/ui/checkbox";
import { cn } from "@blinkdisk/utils/class";
import { FormDisabledContext, useFieldContext } from "@forms/use-app-form";
import React, { useContext } from "react";

const Checkbox = React.forwardRef<
  HTMLButtonElement,
  CheckboxProps & { label: DynamicFieldProps }
>(({ label, className, disabled, ...props }, ref) => {
  const field = useFieldContext<boolean>();
  const disabledContext = useContext(FormDisabledContext);

  return (
    <DynamicField
      {...label}
      innerClassName={cn(
        "flex-row-reverse justify-end items-center gap-3",
        label.innerClassName,
      )}
      errors={label.errors || field.state.meta.errors}
      name={field.name}
    >
      <CheckboxRoot
        {...props}
        ref={ref}
        checked={field.state.value}
        onCheckedChange={(to) => field.setValue(to as boolean)}
        className={className}
        name={field.name}
        id={field.name}
        disabled={disabledContext || disabled}
      />
    </DynamicField>
  );
});

Checkbox.displayName = "Checkbox";

export { Checkbox };
