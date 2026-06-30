import { cn } from "@blinkdisk/utils/class";
import { cva, type VariantProps } from "class-variance-authority";
import type * as React from "react";

const alertVariants = cva(
  "relative w-full rounded-lg border px-4 py-3 text-sm grid has-[>svg]:grid-cols-[calc(var(--spacing)*4)_1fr] grid-cols-[0_1fr] has-[>svg]:gap-x-3 gap-y-0.5 items-start [&>svg]:size-4 [&>svg]:translate-y-0.5 [&>svg]:text-current",
  {
    variants: {
      variant: {
        default: "bg-card text-card-foreground",
        destructive:
          "text-destructive bg-card [&>svg]:text-current *:data-[slot=alert-description]:text-destructive/90 bg-destructive/5 border-destructive/30",
        info: "text-primary [&>svg]:text-current *:data-[slot=alert-description]:text-primary/80 bg-primary/5 border-primary/30",
        warn: "text-amber-600 dark:text-amber-500 [&>svg]:text-current dark:*:data-[slot=alert-description]:text-amber-500/80 bg-amber-500/5 border-amber-500/30 *:data-[slot=alert-description]:text-amber-600/80",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
);

export function Alert({
  className,
  variant,
  ...props
}: React.ComponentProps<"div"> & VariantProps<typeof alertVariants>) {
  return (
    <div
      data-slot="alert"
      role="alert"
      className={cn(alertVariants({ variant }), className)}
      {...props}
    />
  );
}
