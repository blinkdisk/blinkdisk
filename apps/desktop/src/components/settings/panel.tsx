import type { ReactNode } from "react";

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
