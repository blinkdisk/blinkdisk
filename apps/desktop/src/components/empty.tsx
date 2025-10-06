import { cn } from "@utils/class";
import { ReactNode } from "react";

type EmptyProps = {
  title: string;
  description: string;
  icon: ReactNode;
  containerClassName?: string;
  children?: ReactNode;
};

export function Empty({
  title,
  description,
  icon,
  containerClassName,
  children,
}: EmptyProps) {
  return (
    <div
      className={cn(
        "flex h-full w-full flex-col items-center justify-center",
        containerClassName,
      )}
    >
      <div className="mt-auto"></div>
      <div className="bg-muted text-muted-foreground flex size-14 items-center justify-center rounded-xl border [&>svg]:size-6">
        {icon}
      </div>
      <h1 className="mt-8 text-4xl font-bold">{title}</h1>
      <p className="text-muted-foreground mt-4 max-w-xs text-center">
        {description}
      </p>
      {children ? (
        <div className="mt-10 flex items-center gap-4">{children}</div>
      ) : null}
      <div className="mb-auto"></div>
    </div>
  );
}
