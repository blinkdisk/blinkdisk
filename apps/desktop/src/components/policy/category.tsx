import type { ZPolicyType } from "@blinkdisk/schemas/policy";
import {
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@blinkdisk/ui/accordion";
import { Skeleton } from "@blinkdisk/ui/skeleton";
import { PolicyContext } from "@desktop/components/policy/context";
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
  "children" | "id"
> & {
  loading?: boolean;
};

function SettingsCategoryHeader({
  title,
  description,
  icon,
  loading,
}: SettingsCategoryHeaderProps) {
  return (
    <div className="flex items-center gap-4">
      {loading ? (
        <Skeleton className="!size-11 !rounded-lg" />
      ) : (
        <div className="bg-card text-muted-foreground flex size-11 items-center justify-center rounded-lg border-2 [&>svg]:size-5">
          {icon}
        </div>
      )}
      <div className="flex flex-col">
        <div className="flex items-center gap-1.5">
          <h2 className="text-lg font-semibold">
            {loading ? <Skeleton width={180} /> : title}
          </h2>
        </div>
        <p className="text-muted-foreground text-xs font-normal">
          {loading ? <Skeleton width={100} /> : description}
        </p>
      </div>
    </div>
  );
}

export function SettingsCategory({
  id,
  title,
  description,
  children,
  icon,
}: SettingsCategoryProps) {
  const { loading } = useContext(PolicyContext);

  return (
    <AccordionItem value={id} disabled={loading}>
      <AccordionTrigger className="items-center" hideArrow={loading}>
        <SettingsCategoryHeader
          title={title}
          description={description}
          icon={icon}
          loading={loading}
        />
        {loading ? <Skeleton className="!size-4" /> : null}
      </AccordionTrigger>
      <AccordionContent className="m-1 pt-2">{children}</AccordionContent>
    </AccordionItem>
  );
}

type SettingsSectionProps = Omit<SettingsCategoryProps, "id"> & {
  loading?: boolean;
};

export function SettingsSection({
  title,
  description,
  children,
  icon,
  loading = false,
}: SettingsSectionProps) {
  return (
    <section className="grid gap-6">
      <SettingsCategoryHeader
        title={title}
        description={description}
        icon={icon}
        loading={loading}
      />
      <div className="m-1 pt-2">{children}</div>
    </section>
  );
}
