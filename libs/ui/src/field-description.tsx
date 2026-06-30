import { cn } from "@blinkdisk/utils/class";
import type * as React from "react";

export function FieldDescription({
  className,
  ...props
}: React.ComponentProps<"p">) {
  return (
    <p
      data-slot="field-description"
      className={cn(
        "text-muted-foreground group-has-data-horizontal/field:text-balance text-left text-xs font-normal leading-normal [[data-variant=legend]+&]:-mt-1.5",
        "nth-last-2:-mt-1 last:mt-0",
        "[&>a:hover]:text-primary [&>a]:underline [&>a]:underline-offset-4",
        className,
      )}
      {...props}
    />
  );
}
