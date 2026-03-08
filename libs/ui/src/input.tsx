import { Input as InputPrimitive } from "@base-ui/react/input";
import * as React from "react";

import { cn } from "@utils/class";

export type InputProps = React.ComponentProps<"input"> & {
  as?: "textarea" | "input";
};

function Input({ className, type, as = "input", ref, ...props }: InputProps) {
  const As = as === "textarea" ? "textarea" : InputPrimitive;

  return (
    <As
      type={type}
      data-slot="input"
      className={cn(
        "bg-card border-input focus-visible:border-ring focus-visible:ring-ring/50 aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive dark:aria-invalid:border-destructive/50 disabled:bg-input/50 dark:disabled:bg-input/80 focus-visible:ring-3 aria-invalid:ring-3 file:text-foreground placeholder:text-muted-foreground w-full min-w-0 rounded-md border px-3 py-2 text-base outline-none transition-colors file:inline-flex file:h-6 file:border-0 file:bg-transparent file:text-sm file:font-medium disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
        as === "input" && "h-11",
        className,
      )}
      // @ts-expect-error Ref is too complicated
      ref={ref}
      {...props}
    />
  );
}

export { Input };
