import { ZPolicyType } from "@schemas/policy";
import {
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@ui/accordion";
import { ReactNode } from "react";

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
            </div>
            <p className="text-muted-foreground text-xs font-normal">
              {description}
            </p>
          </div>
        </div>
      </AccordionTrigger>
      <AccordionContent className="m-1 pt-2">{children}</AccordionContent>
    </AccordionItem>
  );
}
