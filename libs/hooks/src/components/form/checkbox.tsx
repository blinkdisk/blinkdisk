import { FormDisabledContext, useFieldContext } from "@hooks/use-app-form";
import { CheckboxProps, Checkbox as CheckboxRoot } from "@ui/checkbox";
import { LabelContainer, LabelContainerProps } from "@ui/label";
import { cn } from "@utils/class";
import React, { useContext } from "react";

const Checkbox = React.forwardRef<
  HTMLButtonElement,
  CheckboxProps & { label: LabelContainerProps }
>(({ label, className, disabled, ...props }, ref) => {
  const field = useFieldContext<boolean>();
  const disabledContext = useContext(FormDisabledContext);

  return (
    <LabelContainer
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
    </LabelContainer>
  );
});

Checkbox.displayName = "Checkbox";

export { Checkbox };
