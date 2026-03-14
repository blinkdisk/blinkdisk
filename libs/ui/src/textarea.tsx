import * as React from "react";

import { cn } from "@blinkdisk/utils/class";

function Textarea({ className, ...props }: React.ComponentProps<"textarea">) {
  return (
    <textarea
      data-slot="textarea"
      className={cn(
        "border-input dark:bg-input/30 focus-visible:border-ring focus-visible:ring-ring/50 aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive dark:aria-invalid:border-destructive/50 disabled:bg-input/50 dark:disabled:bg-input/80 focus-visible:ring-3 aria-invalid:ring-3 field-sizing-content placeholder:text-muted-foreground flex min-h-16 w-full rounded-lg border bg-transparent px-2.5 py-2 text-base outline-none transition-colors disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
        className,
      )}
      {...props}
    />
  );
}

export { Textarea };
