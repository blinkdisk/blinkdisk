import { FormDisabledContext, useFieldContext } from "@hooks/use-app-form";
import { LabelContainer, LabelContainerProps } from "@ui/label";
import { SwitchProps, Switch as SwitchRoot } from "@ui/switch";
import { cn } from "@utils/class";
import React, { useContext } from "react";

const Switch = React.forwardRef<
  HTMLButtonElement,
  SwitchProps & { label: LabelContainerProps }
>(({ className, disabled, label, ...props }, ref) => {
  const field = useFieldContext<boolean>();
  const disabledContext = useContext(FormDisabledContext);

  return (
    <LabelContainer
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
    </LabelContainer>
  );
});

Switch.displayName = "Switch";

export { Switch };
