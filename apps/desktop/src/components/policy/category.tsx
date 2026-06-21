import type { ZPolicyType } from "@blinkdisk/schemas/policy";
import { Skeleton } from "@blinkdisk/ui/skeleton";
import { PolicyContext } from "@desktop/components/policy/context";
import { SettingsPanel, SettingsRow } from "@desktop/components/settings";
import { type ReactNode, useContext } from "react";

type SettingsCategoryProps = {
  id: keyof ZPolicyType | string;
  title: string;
  description: string;
  children: ReactNode;
};

export function SettingsCategory({
  id,
  title,
  description,
  children,
}: SettingsCategoryProps) {
  const { loading } = useContext(PolicyContext);

  return (
    <section id={id} className="grid scroll-mt-8 gap-4">
      <div>
        {loading ? (
          <div className="grid gap-1">
            <Skeleton width={150} height="1.25rem" />
            <Skeleton width={260} />
          </div>
        ) : (
          <>
            <h2 className="text-xl font-semibold">{title}</h2>
            <p className="text-muted-foreground mt-1 text-sm">{description}</p>
          </>
        )}
      </div>
      <SettingsPanel>
        <SettingsRow fullWidth>
          {loading ? <Skeleton count={4} height="2.75rem" /> : children}
        </SettingsRow>
      </SettingsPanel>
    </section>
  );
}
