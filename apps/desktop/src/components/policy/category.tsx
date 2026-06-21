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
  icon: ReactNode;
};

export function SettingsCategory({
  id,
  title,
  description,
  children,
  icon,
}: SettingsCategoryProps) {
  const { loading } = useContext(PolicyContext);

  return (
    <section id={id} className="scroll-mt-8">
      <SettingsPanel>
        <SettingsRow fullWidth>
          <div className="flex items-center gap-3">
            {loading ? (
              <Skeleton className="!size-10 !rounded-lg" />
            ) : (
              <div className="bg-muted text-muted-foreground flex size-10 shrink-0 items-center justify-center rounded-lg border [&>svg]:size-5">
                {icon}
              </div>
            )}
            <div className="min-w-0">
              {loading ? (
                <Skeleton width={150} height="1.1rem" />
              ) : (
                <h3 className="font-semibold leading-tight">{title}</h3>
              )}
              <p className="text-muted-foreground mt-1 text-sm">
                {loading ? <Skeleton width={260} /> : description}
              </p>
            </div>
          </div>
        </SettingsRow>
        <SettingsRow fullWidth>
          {loading ? <Skeleton count={4} height="2.75rem" /> : children}
        </SettingsRow>
      </SettingsPanel>
    </section>
  );
}
