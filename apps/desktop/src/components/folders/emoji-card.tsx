import { useQuery } from "@tanstack/react-query";
import { cn } from "@utils/class";
import { useMemo } from "react";
import Twemoji from "react-twemoji";
import { parse } from "twemoji-parser";

export type EmojiCardProps = {
  emoji: string;
  size?: "lg" | "md" | "sm";
  className?: string;
};

export function EmojiCard({ emoji, className, size = "md" }: EmojiCardProps) {
  const { data: emojiToColor } = useQuery({
    queryKey: ["emoji"],
    queryFn: async () => {
      return (await import("@desktop/lib/emoji")).emojiToColor as any;
    },
  });

  const color = useMemo(() => {
    if (!emojiToColor) return "100, 100, 100";

    const parsed = parse(emoji, {
      buildUrl: (code) => code,
    });

    return parsed?.length && emojiToColor[parsed[0]?.url || ""]
      ? emojiToColor[parsed[0]?.url || ""]
      : "100, 100, 100";
  }, [emojiToColor, emoji]);

  return (
    <div
      className={cn("bg-background rounded-md", size === "lg" && "rounded-lg")}
    >
      <div
        style={{
          background: `rgba(${color}, 0.15)`,
          borderColor: `rgba(${color}, 0.1)`,
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
