import { FormDisabledContext, useFieldContext } from "@hooks/use-app-form";
import { InputOTP, InputOTPProps } from "@ui/input-otp";
import { LabelContainer, LabelContainerProps } from "@ui/label";
import React, { useContext } from "react";

const Code = React.forwardRef<
  HTMLInputElement,
  { label?: LabelContainerProps } & InputOTPProps
>(({ className, label, maxLength, render, disabled }, ref) => {
  const field = useFieldContext<string>();
  const disabledContext = useContext(FormDisabledContext);

  return (
    <LabelContainer
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
        // Types are weird here, just closing the InputOTP
        // tag doesn't satisfy the children prop.
        // eslint-disable-next-line
        children={undefined}
        disabled={disabledContext || disabled}
      />
    </LabelContainer>
  );
});

Code.displayName = "Code";

export { Code };
