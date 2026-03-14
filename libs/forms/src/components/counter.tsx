import { FormDisabledContext, useFieldContext } from "#use-app-form";
import { Button } from "@blinkdisk/ui/button";
import { DynamicField, DynamicFieldProps } from "@blinkdisk/ui/dynamic-field";
import { Input, InputProps } from "@blinkdisk/ui/input";
import { cn } from "@blinkdisk/utils/class";
import { MinusIcon, PlusIcon } from "lucide-react";
import React, { useContext } from "react";

const Counter = React.forwardRef<
  HTMLInputElement,
  InputProps & { label: DynamicFieldProps }
>(({ className, label, disabled, ...props }, ref) => {
  const field = useFieldContext<number>();
  const disabledContext = useContext(FormDisabledContext);

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
            e:
              | React.ChangeEvent<HTMLInputElement>
              | React.ChangeEvent<HTMLTextAreaElement>,
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
});

Counter.displayName = "Counter";

export { Counter };
