import type { ReactNode } from "react";

type SettingsGroupProps = {
  title: string;
  children: ReactNode;
};

export function SettingsGroup({ title, children }: SettingsGroupProps) {
  return (
    <section className="grid gap-4">
      <h2 className="text-xl font-semibold">{title}</h2>
      {children}
    </section>
  );
}

type SettingsPanelProps = {
  children: ReactNode;
};

export function SettingsPanel({ children }: SettingsPanelProps) {
  return (
    <section className="border-border bg-card overflow-hidden rounded-xl border">
      {children}
    </section>
  );
}

type SettingsRowProps = {
  title?: string;
  description?: string;
  titleClassName?: string;
  fullWidth?: boolean;
  separated?: boolean;
  children: ReactNode;
};

export function SettingsRow({
  title,
  description,
  titleClassName,
  fullWidth,
  separated,
  children,
}: SettingsRowProps) {
  if (fullWidth) {
    return (
      <div className="border-border border-b px-5 py-4 last:border-b-0">
        {children}
      </div>
    );
  }

  return (
    <div
      className={`border-border flex flex-col gap-4 border-b px-5 py-4 last:border-b-0 md:min-h-20 md:flex-row md:items-center md:justify-between ${
        separated ? "border-t" : ""
      }`}
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
