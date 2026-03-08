import { FormDisabledContext, useFieldContext } from "@hooks/use-app-form";
import { DynamicField, DynamicFieldProps } from "@ui/dynamic-field";
import { Input, InputProps } from "@ui/input";
import React, { useContext } from "react";

const Text = React.forwardRef<
  HTMLInputElement,
  InputProps & { label: DynamicFieldProps }
>(({ type, className, label, disabled, ...props }, ref) => {
  const field = useFieldContext<string | number>();
  const disabledContext = useContext(FormDisabledContext);

  return (
    <DynamicField {...label} errors={field.state.meta.errors} name={field.name}>
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
    </DynamicField>
  );
});

Text.displayName = "TextField";

export { Text };
