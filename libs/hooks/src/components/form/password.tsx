import { FormDisabledContext, useFieldContext } from "@hooks/use-app-form";
import { Input } from "@ui/input";
import { LabelContainer, LabelContainerProps } from "@ui/label";
import { cn } from "@utils/class";
import { EyeIcon, EyeOffIcon } from "lucide-react";
import React, { useContext, useState } from "react";

const Password = React.forwardRef<
  HTMLInputElement,
  React.ComponentProps<"input"> & { label: LabelContainerProps }
>(({ className, label, disabled, ...props }, ref) => {
  const field = useFieldContext<string>();
  const disabledContext = useContext(FormDisabledContext);

  const [showPassword, setShowPassword] = useState(false);

  return (
    <LabelContainer
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
    </LabelContainer>
  );
});

Password.displayName = "Password";

export { Password };
