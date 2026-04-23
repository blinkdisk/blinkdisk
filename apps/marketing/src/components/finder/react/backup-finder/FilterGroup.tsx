import { cn } from "@blinkdisk/utils/class";
import { ChevronDownIcon, type LucideIcon } from "lucide-react";
import type { ReactNode } from "react";

import type { FilterGroupId } from "./types";

type FilterGroupProps = {
  id: FilterGroupId;
  title: string;
  description?: string;
  icon: LucideIcon;
  activeCount: number;
  open: boolean;
  onToggle: () => void;
  children: ReactNode;
};

export function FilterGroup({
  id,
  title,
  description,
  icon: Icon,
  activeCount,
  open,
  onToggle,
  children,
}: FilterGroupProps) {
  return (
    <div className="flex flex-col gap-3">
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={open}
        aria-controls={`filter-group-${id}`}
        className="group flex items-start gap-2 text-left"
      >
        <Icon className="text-muted-foreground mt-0.5 size-4 shrink-0" />
        <div className="flex-1">
          <h3 className="text-foreground text-sm font-semibold leading-tight">
            {title}
            {activeCount > 0 && (
              <span className="text-muted-foreground ml-1.5 text-xs font-normal">
                ({activeCount})
              </span>
            )}
          </h3>
          {description && (
            <p className="text-muted-foreground mt-0.5 text-xs">
              {description}
            </p>
          )}
        </div>
        <ChevronDownIcon
          className={cn(
            "text-muted-foreground mt-0.5 size-4 shrink-0 transition-transform",
            open && "rotate-180",
          )}
        />
      </button>
      {open && (
        <div id={`filter-group-${id}`} className="flex flex-col gap-2.5 pl-6">
          {children}
        </div>
      )}
    </div>
  );
}
