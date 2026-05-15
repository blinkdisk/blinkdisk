import {
  DynamicField,
  type DynamicFieldProps,
} from "@blinkdisk/components/dynamic-field";
import { InputOTP, type InputOTPProps } from "@blinkdisk/ui/input-otp";
import { FormDisabledContext, useFieldContext } from "@forms/use-app-form";
import React, { useContext } from "react";

const Code = React.forwardRef<
  HTMLInputElement,
  { label?: DynamicFieldProps } & InputOTPProps
>(({ className, label, maxLength, render, disabled }, ref) => {
  const field = useFieldContext<string>();
  const disabledContext = useContext(FormDisabledContext);

  return (
    <DynamicField
      {...(label ?? {})}
      errors={field.state.meta.errors}
      name={field.name}
    >
      <InputOTP
        className={className}
        ref={ref}
        id={field.name}
        name={field.name}
        value={field.state.value}
        onBlur={() => field.handleBlur()}
        onChange={(value: string) => field.handleChange(value.toUpperCase())}
        containerClassName="group flex items-center has-[:disabled]:opacity-30"
        maxLength={maxLength}
        render={render}
        pasteTransformer={(t) => t.replace(/\s|-/g, "")}
        // biome-ignore lint/correctness/noChildrenProp: Types are weird here
        children={undefined}
        disabled={disabledContext || disabled}
      />
    </DynamicField>
  );
});

Code.displayName = "Code";

export { Code };
