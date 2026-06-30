import {
  DynamicField,
  type DynamicFieldProps,
} from "@blinkdisk/components/dynamic-field";
import { Input, type InputProps } from "@blinkdisk/ui/input";
import { FormDisabledContext, useFieldContext } from "@forms/form-context";
import type { ChangeEvent, Ref } from "react";
import { use } from "react";

type TextProps = InputProps & {
  label: DynamicFieldProps;
  ref?: Ref<HTMLInputElement>;
};

function Text({ type, className, label, disabled, ref, ...props }: TextProps) {
  const field = useFieldContext<string | number>();
  const disabledContext = use(FormDisabledContext);

  return (
    <DynamicField {...label} errors={field.state.meta.errors} name={field.name}>
      <Input
        className={className}
        ref={ref}
        type={type}
        id={field.name}
        name={field.name}
        value={field.state.value ?? ""}
        onBlur={() => field.handleBlur()}
        onChange={(
          e: ChangeEvent<HTMLInputElement> | ChangeEvent<HTMLTextAreaElement>,
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
}

export { Text };
