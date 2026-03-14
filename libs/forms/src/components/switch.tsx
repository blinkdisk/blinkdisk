import { FormDisabledContext, useFieldContext } from "#use-app-form";
import { DynamicField, DynamicFieldProps } from "@blinkdisk/ui/dynamic-field";
import { SwitchProps, Switch as SwitchRoot } from "@blinkdisk/ui/switch";
import { cn } from "@blinkdisk/utils/class";
import React, { useContext } from "react";

const Switch = React.forwardRef<
  HTMLButtonElement,
  SwitchProps & { label: DynamicFieldProps }
>(({ className, disabled, label, ...props }, ref) => {
  const field = useFieldContext<boolean>();
  const disabledContext = useContext(FormDisabledContext);

  return (
    <DynamicField
      {...label}
      innerClassName={cn(
        "flex-row justify-between items-center",
        label.innerClassName,
      )}
      errors={field.state.meta.errors}
      name={field.name}
    >
      <SwitchRoot
        {...props}
        ref={ref}
        checked={field.state.value}
        onCheckedChange={(to) => field.setValue(to)}
        className={className}
        name={field.name}
        id={field.name}
        disabled={disabledContext || disabled}
      />
    </DynamicField>
  );
});

Switch.displayName = "Switch";

export { Switch };
