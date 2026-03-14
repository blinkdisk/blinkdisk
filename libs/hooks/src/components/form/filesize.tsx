import {
  FormDisabledContext,
  useFieldContext,
  useStore,
} from "@hooks/use-app-form";
import { ZFileSizeType } from "@schemas/policy";
import { DynamicField, DynamicFieldProps } from "@ui/dynamic-field";
import { Input, InputProps } from "@ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@ui/select";
import { cn } from "@utils/class";
import React, { useContext } from "react";

const filesizeUnits = [
  { value: "B", label: "Bytes" },
  { value: "KB", label: "KB" },
  { value: "MB", label: "MB" },
  { value: "GB", label: "GB" },
  { value: "TB", label: "TB" },
] as const satisfies { value: string; label: string }[];

const Filesize = React.forwardRef<
  HTMLInputElement,
  InputProps & { label: DynamicFieldProps }
>(({ className, label, disabled, ...props }, ref) => {
  const field = useFieldContext<ZFileSizeType | undefined>();
  const disabledContext = useContext(FormDisabledContext);
  const formValue = useStore(field.store, (state) => state.value);

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
        <Input
          className={cn("w-20 text-center", className)}
          ref={ref}
          type="number"
          id={field.name}
          name={field.name}
          value={formValue?.value !== undefined ? formValue.value : ""}
          onBlur={() => field.handleBlur()}
          onChange={(
            e:
              | React.ChangeEvent<HTMLInputElement>
              | React.ChangeEvent<HTMLTextAreaElement>,
          ) =>
            field.handleChange({
              value:
                "valueAsNumber" in e.target && !isNaN(e.target.valueAsNumber)
                  ? e.target.valueAsNumber
                  : e.target.value !== ""
                    ? Number(e.target.value)
                    : undefined,
              unit: formValue?.unit || "B",
            })
          }
          disabled={disabledContext || disabled}
          {...props}
        />
        <Select
          value={formValue?.unit || "B"}
          disabled={disabledContext || disabled}
          onValueChange={(to) =>
            field.handleChange({
              value: formValue?.value,
              unit: to as ZFileSizeType["unit"],
            })
          }
          items={filesizeUnits}
        >
          <SelectTrigger className="gap-1">
            <SelectValue placeholder="" />
          </SelectTrigger>
          <SelectContent>
            {filesizeUnits.map((unit) => (
              <SelectItem key={unit.value} value={unit.value}>
                {unit.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </DynamicField>
  );
});

Filesize.displayName = "Filesize";

export { Filesize };
