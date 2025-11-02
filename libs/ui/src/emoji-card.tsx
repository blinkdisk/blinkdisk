import { emojiToHue } from "@config/emoji";
import { cn } from "@utils/class";
import { useEffect, useMemo } from "react";
import Twemoji from "react-twemoji";
import { parse } from "twemoji-parser";

export type EmojiCardProps = {
  emoji: string | undefined;
  size?: "lg" | "md" | "sm";
  className?: string;
};

const defaultColor = "0deg 0% 39%";

export function EmojiCard({
  emoji = "📁",
  className,
  size = "md",
}: EmojiCardProps) {
  useEffect(() => {}, []);

  const color = useMemo(() => {
    if (!emojiToHue) return defaultColor;

    const parsed = parse(emoji, {
      buildUrl: (code) => code,
    });

    return parsed?.length && emojiToHue[parsed[0]?.url || ""]
      ? `${emojiToHue[parsed[0]?.url || ""]}deg 100% 60%`
      : defaultColor;
  }, [emoji]);

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
          // The twemoji library seems to add an empty string for some emojis, which
          // moves the emoji off-center. We use text-[0px] to make the text 0x0px.
          "flex items-center justify-center rounded-md border-2 text-[0px]",
          size === "lg"
            ? "size-14 rounded-lg [&>div>img]:size-6"
            : size === "sm"
              ? "size-9 [&>div>img]:size-4"
              : "size-11 [&>div>img]:size-5",
          className,
        )}
      >
        <Twemoji options={{ className: "twemoji" }}>{emoji}</Twemoji>
      </div>
    </div>
  );
}
