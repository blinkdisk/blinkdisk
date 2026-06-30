import { cn } from "@blinkdisk/utils/class";
import type { ReactNode } from "react";

type SettingsRowProps = {
  title?: string;
  description?: string;
  titleClassName?: string;
  className?: string;
  fullWidth?: boolean;
  separated?: boolean;
  children: ReactNode;
};

export function SettingsRow({
  title,
  description,
  titleClassName,
  className,
  fullWidth,
  separated,
  children,
}: SettingsRowProps) {
  if (fullWidth) {
    return (
      <div
        className={cn(
          "border-border border-b px-5 py-4 last:border-b-0",
          className,
        )}
      >
        {children}
      </div>
    );
  }

  return (
    <div
      className={cn(
        "border-border flex flex-col gap-4 border-b px-5 py-4 last:border-b-0 md:min-h-20 md:flex-row md:items-center md:justify-between",
        separated && "border-t",
        className,
      )}
    >
      <div className="min-w-0">
        {title ? (
          <p className={titleClassName || "text-base font-medium"}>{title}</p>
        ) : null}
        {description ? (
          <p className="text-muted-foreground mt-1 max-w-sm text-sm">
            {description}
          </p>
        ) : null}
      </div>
      <div className="flex w-full justify-start md:w-auto md:justify-end">
        {children}
      </div>
    </div>
  );
}
