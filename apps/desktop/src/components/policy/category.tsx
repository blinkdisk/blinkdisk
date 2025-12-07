import { usePolicyChanges } from "@desktop/hooks/use-policy-changes";
import { ZPolicyType } from "@schemas/policy";
import {
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@ui/accordion";
import { Badge } from "@ui/badge";
import { ReactNode } from "react";

type SettingsCategoryProps = {
  id: keyof ZPolicyType | string;
  title: string;
  description: string;
  children: ReactNode;
  icon: ReactNode;
  folderId?: string;
};

export function SettingsCategory({
  id,
  title,
  description,
  children,
  icon,
  folderId,
}: SettingsCategoryProps) {
  const changes = usePolicyChanges({ folderId });

  return (
    <AccordionItem value={id}>
      <AccordionTrigger className="items-center">
        <div className="flex items-center gap-4">
          <div className="bg-card text-muted-foreground flex size-11 items-center justify-center rounded-lg border-2 [&>svg]:size-5">
            {icon}
          </div>
          <div className="flex flex-col">
            <div className="flex items-center gap-1.5">
              <h2 className="text-lg font-semibold">{title}</h2>
              {changes && id in changes && changes[id as keyof ZPolicyType] ? (
                <Badge variant="subtle">Modified</Badge>
              ) : null}
            </div>
            <p className="text-muted-foreground text-xs font-normal">
              {description}
            </p>
          </div>
        </div>
      </AccordionTrigger>
      <AccordionContent className="pt-2">{children}</AccordionContent>
    </AccordionItem>
  );
}
