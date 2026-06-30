import {
  DynamicField,
  type DynamicFieldProps,
} from "@blinkdisk/components/dynamic-field";
import { InputOTP, type InputOTPProps } from "@blinkdisk/ui/input-otp";
import { FormDisabledContext, useFieldContext } from "@forms/form-context";
import type { Ref } from "react";
import { use } from "react";

type CodeProps = {
  label?: DynamicFieldProps;
  ref?: Ref<HTMLInputElement>;
} & Omit<InputOTPProps, "children" | "render"> & {
    render: Exclude<InputOTPProps["render"], undefined>;
  };

function Code({
  className,
  label,
  maxLength,
  render,
  disabled,
  ref,
}: CodeProps) {
  const field = useFieldContext<string>();
  const disabledContext = use(FormDisabledContext);

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
        disabled={disabledContext || disabled}
      />
    </DynamicField>
  );
}

export { Code };
