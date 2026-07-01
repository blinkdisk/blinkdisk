import {
  DynamicField,
  type DynamicFieldProps,
} from "@blinkdisk/components/dynamic-field";
import { Button } from "@blinkdisk/ui/button";
import { Input, type InputProps } from "@blinkdisk/ui/input";
import { cn } from "@blinkdisk/utils/class";
import { FormDisabledContext, useFieldContext } from "@forms/form-context";
import { MinusIcon, PlusIcon } from "lucide-react";
import type { ChangeEvent, Ref } from "react";
import { use } from "react";

type CounterProps = InputProps & {
  label: DynamicFieldProps;
  ref?: Ref<HTMLInputElement>;
};

function Counter({ className, label, disabled, ref, ...props }: CounterProps) {
  const field = useFieldContext<number>();
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
      <div className="flex items-center gap-2">
        <Button
          onClick={() => field.handleChange((field.state.value || 0) - 1)}
          type="button"
          size="icon-sm"
          variant="secondary"
          disabled={disabledContext || disabled}
        >
          <MinusIcon />
        </Button>
        <Input
          className={cn("w-16 text-center", className)}
          ref={ref}
          type="number"
          id={field.name}
          name={field.name}
          value={field.state.value ?? ""}
          onBlur={() => field.handleBlur()}
          onChange={(
            e: ChangeEvent<HTMLInputElement> | ChangeEvent<HTMLTextAreaElement>,
          ) =>
            field.handleChange(
              "valueAsNumber" in e.target
                ? e.target.valueAsNumber
                : Number(e.target.value),
            )
          }
          disabled={disabledContext || disabled}
          {...props}
        />
        <Button
          onClick={() => field.handleChange((field.state.value || 0) + 1)}
          type="button"
          size="icon-sm"
          variant="secondary"
          disabled={disabledContext || disabled}
        >
          <PlusIcon />
        </Button>
      </div>
    </DynamicField>
  );
}

export { Counter };
