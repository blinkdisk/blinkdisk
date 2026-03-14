import { PolicyContext } from "@desktop/components/policy/context";
import { ZPolicyType } from "@schemas/policy";
import {
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@ui/accordion";
import { Skeleton } from "@ui/skeleton";
import { ReactNode, useContext } from "react";

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
    <AccordionItem value={id} disabled={loading}>
      <AccordionTrigger className="items-center" hideArrow={loading}>
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
        {loading ? <Skeleton className="!size-4" /> : null}
      </AccordionTrigger>
      <AccordionContent className="m-1 pt-2">{children}</AccordionContent>
    </AccordionItem>
  );
}
