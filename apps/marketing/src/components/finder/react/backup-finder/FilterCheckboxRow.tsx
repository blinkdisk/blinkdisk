import { Checkbox } from "@blinkdisk/ui/checkbox";
import { cn } from "@blinkdisk/utils/class";
import type { ComponentProps } from "react";

type FilterCheckboxRowProps = {
  id: string;
  label: string;
  description?: string;
  checked: ComponentProps<typeof Checkbox>["checked"];
  onToggle: () => void;
  className?: string;
};

export function FilterCheckboxRow({
  id,
  label,
  description,
  checked,
  onToggle,
  className,
}: FilterCheckboxRowProps) {
  return (
    <label
      htmlFor={id}
      className={cn(
        "flex cursor-pointer items-start gap-2.5 text-sm",
        className,
      )}
    >
      <Checkbox
        id={id}
        checked={checked}
        onCheckedChange={() => onToggle()}
        className="mt-0.5"
      />
      <span className="flex-1 leading-tight">
        <span className="text-foreground font-medium">{label}</span>
        {description && (
          <span className="text-muted-foreground block text-xs">
            {description}
          </span>
        )}
      </span>
    </label>
  );
}
