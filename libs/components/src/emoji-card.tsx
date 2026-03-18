import { EMOJI_TO_HUE } from "@blinkdisk/constants/emoji";
import { cn } from "@blinkdisk/utils/class";
import { useMemo } from "react";
import { parse } from "twemoji-parser";

export type EmojiCardProps = {
  emoji: string | undefined;
  size?: "lg" | "md" | "sm";
  theme?: "light" | "dark";
  className?: string;
};

const defaultColor = "0deg 0% 39%";

export function EmojiCard({
  emoji = "📁",
  className,
  theme,
  size = "md",
}: EmojiCardProps) {
  const { color, emojiUrl } = useMemo(() => {
    const parsed = parse(emoji);
    const url = parsed[0]?.url;
    const code = url?.split("/").pop()?.replace(".svg", "") || "";
    const hue = EMOJI_TO_HUE[code as keyof typeof EMOJI_TO_HUE];
    return {
      color:
        hue !== undefined
          ? `${hue}deg 100% ${!theme ? "50%" : theme === "dark" ? "65%" : "35%"}`
          : defaultColor,
      emojiUrl: url,
    };
  }, [emoji, theme]);

  return (
    <div
      className={cn("bg-background rounded-md", size === "lg" && "rounded-lg")}
    >
      <div
        style={{
          background: `hsl(${color} / 0.15)`,
          borderColor: `hsl(${color} / 0.1)`,
        }}
        className={cn(
          "flex shrink-0 items-center justify-center rounded-md border-2",
          size === "lg"
            ? "size-14 rounded-lg"
            : size === "sm"
              ? "size-9"
              : "size-11",
          className,
        )}
      >
        {emojiUrl ? (
          <img
            src={emojiUrl}
            alt={emoji}
            className={cn(
              size === "lg" ? "size-6" : size === "sm" ? "size-4" : "size-5",
            )}
          />
        ) : (
          <span>{emoji}</span>
        )}
      </div>
    </div>
  );
}
