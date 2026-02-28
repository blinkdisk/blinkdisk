import { useTheme } from "@desktop/hooks/use-theme";
import { cn } from "@utils/class";
import { PinIcon, XIcon } from "lucide-react";
import seedrandom from "seedrandom";

function getPinHue(pin: string) {
  const rng = seedrandom(pin);
  return Math.floor(rng() * 360);
}

type PinBadgeProps = {
  pin: string;
  size?: "sm" | "default";
  onRemove?: () => void;
};

export function PinBadge({ pin, size = "default", onRemove }: PinBadgeProps) {
  const { dark } = useTheme();
  const hue = getPinHue(pin);
  const l = dark ? "60%" : "40%";

  return (
    <span
      className={cn(
        "inline-flex items-center rounded-md border font-medium",
        size === "sm"
          ? "gap-1 px-1.5 py-0.5 text-xs"
          : "gap-1.5 px-2.5 py-1 text-sm",
      )}
      style={{
        backgroundColor: `hsl(${hue} 70% ${l} / 0.1)`,
        borderColor: `hsl(${hue} 70% ${l} / 0.3)`,
        color: `hsl(${hue} 70% ${l})`,
      }}
    >
      <PinIcon className={size === "sm" ? "size-3" : "size-3.5"} />
      {pin}
      {onRemove && (
        <button
          type="button"
          onClick={onRemove}
          className="-mr-0.5 rounded p-0.5 transition-colors hover:bg-black/10 dark:hover:bg-white/10"
        >
          <XIcon className={size === "sm" ? "size-3" : "size-3.5"} />
        </button>
      )}
    </span>
  );
}
