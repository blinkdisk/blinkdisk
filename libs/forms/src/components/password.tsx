import {
  DynamicField,
  type DynamicFieldProps,
} from "@blinkdisk/components/dynamic-field";
import { Input } from "@blinkdisk/ui/input";
import { cn } from "@blinkdisk/utils/class";
import { FormDisabledContext, useFieldContext } from "@forms/form-context";
import { EyeIcon, EyeOffIcon } from "lucide-react";
import type { ComponentProps, Ref } from "react";
import { use, useState } from "react";

type PasswordProps = ComponentProps<"input"> & {
  label: DynamicFieldProps;
  ref?: Ref<HTMLInputElement>;
};

function Password({
  className,
  label,
  disabled,
  ref,
  ...props
}: PasswordProps) {
  const field = useFieldContext<string>();
  const disabledContext = use(FormDisabledContext);

  const [showPassword, setShowPassword] = useState(false);

  return (
    <DynamicField
      {...label}
      innerClassName={cn("relative", label.innerClassName)}
      errors={field.state.meta.errors}
      name={field.name}
    >
      <Input
        type={showPassword ? "text" : "password"}
        className={cn("pr-8", className)}
        ref={ref}
        id={field.name}
        name={field.name}
        value={field.state.value}
        onBlur={() => field.handleBlur()}
        onChange={(e) => field.handleChange(e.target.value)}
        disabled={disabledContext || disabled}
        {...props}
      />
      <button
        type="button"
        className="text-muted-foreground hover:text-foreground absolute bottom-0 right-0 flex size-11 items-center justify-center rounded-lg border-none outline-none transition-colors"
        onClick={() => setShowPassword(!showPassword)}
        tabIndex={-1}
      >
        {showPassword ? (
          <EyeOffIcon className="size-4" />
        ) : (
          <EyeIcon className="size-4" />
        )}
      </button>
    </DynamicField>
  );
}

export { Password };
