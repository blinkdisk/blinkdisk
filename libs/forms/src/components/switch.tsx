import {
  DynamicField,
  type DynamicFieldProps,
} from "@blinkdisk/components/dynamic-field";
import { type SwitchProps, Switch as SwitchRoot } from "@blinkdisk/ui/switch";
import { cn } from "@blinkdisk/utils/class";
import { FormDisabledContext, useFieldContext } from "@forms/form-context";
import type { Ref } from "react";
import { use } from "react";

type SwitchFieldProps = SwitchProps & {
  label: DynamicFieldProps;
  ref?: Ref<HTMLButtonElement>;
};

function Switch({
  className,
  disabled,
  label,
  ref,
  ...props
}: SwitchFieldProps) {
  const field = useFieldContext<boolean>();
  const disabledContext = use(FormDisabledContext);

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
}

export { Switch };
