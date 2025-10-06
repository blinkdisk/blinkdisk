import {
  FormDisabledContext,
  useFieldContext,
  useStore,
} from "@hooks/use-app-form";
import { ZFileSizeType } from "@schemas/policy";
import { Input, InputProps } from "@ui/input";
import { LabelContainer, LabelContainerProps } from "@ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@ui/select";
import { cn } from "@utils/class";
import React, { useContext } from "react";

const Filesize = React.forwardRef<
  HTMLInputElement,
  InputProps & { label: LabelContainerProps }
>(({ className, label, disabled, ...props }, ref) => {
  const field = useFieldContext<ZFileSizeType | undefined>();
  const disabledContext = useContext(FormDisabledContext);
  const formValue = useStore(field.store, (state) => state.value);

  return (
    <LabelContainer
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
        >
          <SelectTrigger className="gap-1">
            <SelectValue placeholder="" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="B">Bytes</SelectItem>
            <SelectItem value="KB">KB</SelectItem>
            <SelectItem value="MB">MB</SelectItem>
            <SelectItem value="GB">GB</SelectItem>
            <SelectItem value="TB">TB</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </LabelContainer>
  );
});

Filesize.displayName = "Filesize";

export { Filesize };
