import { FormDisabledContext, useFieldContext } from "@hooks/use-app-form";
import { Input, InputProps } from "@ui/input";
import { LabelContainer, LabelContainerProps } from "@ui/label";
import React, { useContext } from "react";

const Text = React.forwardRef<
  HTMLInputElement,
  InputProps & { label: LabelContainerProps }
>(({ type, className, label, disabled, ...props }, ref) => {
  const field = useFieldContext<string | number>();
  const disabledContext = useContext(FormDisabledContext);

  return (
    <LabelContainer
      {...label}
      errors={field.state.meta.errors}
      name={field.name}
    >
      <Input
        className={className}
        ref={ref}
        type={type}
        id={field.name}
        name={field.name}
        value={field.state.value}
        onBlur={() => field.handleBlur()}
        onChange={(
          e:
            | React.ChangeEvent<HTMLInputElement>
            | React.ChangeEvent<HTMLTextAreaElement>,
        ) =>
          type === "number" && "valueAsNumber" in e.target
            ? field.handleChange(e.target.valueAsNumber)
            : field.handleChange(e.target.value)
        }
        disabled={disabledContext || disabled}
        {...props}
      />
    </LabelContainer>
  );
});

Text.displayName = "TextField";

export { Text };
