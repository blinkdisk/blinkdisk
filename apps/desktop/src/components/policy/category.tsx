import { usePolicyChanges } from "@desktop/hooks/use-policy-changes";
import { useAppTranslation } from "@hooks/use-app-translation";
import { ZPolicyLevelType, ZPolicyType } from "@schemas/policy";
import {
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@ui/accordion";
import { Badge } from "@ui/badge";
import { ReactNode } from "react";

export type PolicyCategoryProps = {
  level: ZPolicyLevelType;
  folderId?: string;
  mock?: boolean;
};

type SettingsCategoryProps = {
  id: keyof ZPolicyType | string;
  title: string;
  description: string;
  children: ReactNode;
  icon: ReactNode;
  folderId?: string;
  mock?: boolean;
};

export function SettingsCategory({
  id,
  title,
  description,
  children,
  icon,
  folderId,
  mock,
}: SettingsCategoryProps) {
  const changes = usePolicyChanges({ folderId, mock });
  const { t } = useAppTranslation("settings.folder");

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
                <Badge variant="subtle">{t("modified")}</Badge>
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
