import type { ZPolicyType } from "@blinkdisk/schemas/policy";
import { Skeleton } from "@blinkdisk/ui/skeleton";
import { PolicyContext } from "@desktop/components/policy/context";
import {
  SettingsGroup,
  SettingsPanel,
  SettingsRow,
} from "@desktop/components/settings";
import { type ReactNode, useContext } from "react";

type SettingsCategoryProps = {
  id: keyof ZPolicyType | string;
  title: string;
  description: string;
  children: ReactNode;
  icon: ReactNode;
};

type SettingsCategoryHeaderProps = Omit<
  SettingsCategoryProps,
  "children" | "id" | "title"
> & {
  loading?: boolean;
};

function SettingsCategoryHeader({
  description,
  icon,
  loading,
}: SettingsCategoryHeaderProps) {
  return (
    <div className="flex items-center gap-4">
      {loading ? (
        <Skeleton className="!size-10 !rounded-lg" />
      ) : (
        <div className="bg-card text-muted-foreground flex size-10 items-center justify-center rounded-lg border [&>svg]:size-5">
          {icon}
        </div>
      )}
      <div className="min-w-0">
        <p className="text-muted-foreground mt-1 text-sm">
          {loading ? <Skeleton width={240} /> : description}
        </p>
      </div>
    </div>
  );
}

export function SettingsCategory({
  title,
  description,
  children,
  icon,
}: SettingsCategoryProps) {
  const { loading } = useContext(PolicyContext);

  return (
    <SettingsGroup title={title}>
      <SettingsPanel>
        <SettingsRow fullWidth>
          <SettingsCategoryHeader
            description={description}
            icon={icon}
            loading={loading}
          />
        </SettingsRow>
        <SettingsRow fullWidth>
          {loading ? <Skeleton count={4} height="2.75rem" /> : children}
        </SettingsRow>
      </SettingsPanel>
    </SettingsGroup>
  );
}
