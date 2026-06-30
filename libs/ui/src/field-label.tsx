import { cn } from "@blinkdisk/utils/class";
import { Label } from "@ui/label";
import type * as React from "react";

export function FieldLabel({
  className,
  ...props
}: React.ComponentProps<typeof Label>) {
  return (
    <Label
      data-slot="field-label"
      className={cn(
        "has-data-checked:bg-primary/5 has-data-checked:border-primary/30 dark:has-data-checked:border-primary/20 dark:has-data-checked:bg-primary/10 group/field-label peer/field-label flex w-fit gap-2 leading-snug has-[>[data-slot=field]]:rounded-lg has-[>[data-slot=field]]:border *:data-[slot=field]:p-2.5 group-data-[disabled=true]/field:opacity-50",
        "has-[>[data-slot=field]]:w-full has-[>[data-slot=field]]:flex-col",
        className,
      )}
      {...props}
    />
  );
}
