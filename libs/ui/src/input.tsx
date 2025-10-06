import * as React from "react";

import { cn } from "@utils/class";

export type InputProps =
  | (React.ComponentProps<"input"> & {
      as?: "input";
    })
  | (React.ComponentProps<"textarea"> & {
      as: "textarea";
      type?: string;
    });

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ as, className, type, ...props }, ref) => {
    const As = as === "textarea" ? "textarea" : "input";

    return (
      <As
        type={type}
        className={cn(
          "border-input bg-card ring-offset-background file:text-foreground placeholder:text-muted-foreground focus-visible:ring-ring flex w-full rounded-md border px-3 py-2 text-base file:border-0 file:bg-transparent file:text-sm file:font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
          As === "input" && "h-11",
          className,
        )}
        // @ts-expect-error TODO: Find a better way to type this
        ref={ref}
        {...props}
      />
    );
  },
);
Input.displayName = "Input";

export { Input };
