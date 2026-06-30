import { cn } from "@blinkdisk/utils/class";
import { TriangleAlertIcon } from "lucide-react";
import type * as React from "react";

export function FieldError({
  className,
  children,
  errors,
  ...props
}: React.ComponentProps<"div"> & {
  errors?: Array<{ message?: string } | undefined>;
}) {
  if (children) {
    return (
      <div
        role="alert"
        data-slot="field-error"
        className={cn("text-destructive text-sm font-normal", className)}
        {...props}
      >
        <TriangleAlertIcon className="-mt-0.5 mr-2 inline-block size-4" />
        {children}
      </div>
    );
  }

  if (!errors?.length) {
    return null;
  }

  const uniqueErrors = [
    ...new Map(errors.map((error) => [error?.message, error])).values(),
  ];

  const content =
    uniqueErrors.length === 1 ? (
      uniqueErrors[0]?.message
    ) : (
      <ul className="ml-4 flex list-disc flex-col gap-1">
        {uniqueErrors.map(
          (error) =>
            error?.message && <li key={error.message}>{error.message}</li>,
        )}
      </ul>
    );

  if (!content) {
    return null;
  }

  return (
    <div
      role="alert"
      data-slot="field-error"
      className={cn("text-destructive text-sm font-normal", className)}
      {...props}
    >
      <TriangleAlertIcon className="-mt-0.5 mr-2 inline-block size-4" />
      {content}
    </div>
  );
}
