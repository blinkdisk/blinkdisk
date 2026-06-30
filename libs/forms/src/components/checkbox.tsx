import {
  DynamicField,
  type DynamicFieldProps,
} from "@blinkdisk/components/dynamic-field";
import {
  type CheckboxProps,
  Checkbox as CheckboxRoot,
} from "@blinkdisk/ui/checkbox";
import { cn } from "@blinkdisk/utils/class";
import { FormDisabledContext, useFieldContext } from "@forms/form-context";
import type { Ref } from "react";
import { use } from "react";

type CheckboxFieldProps = CheckboxProps & {
  label: DynamicFieldProps;
  ref?: Ref<HTMLButtonElement>;
};

function Checkbox({
  label,
  className,
  disabled,
  ref,
  ...props
}: CheckboxFieldProps) {
  const field = useFieldContext<boolean>();
  const disabledContext = use(FormDisabledContext);

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
}

export { Checkbox };
