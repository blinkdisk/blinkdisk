import { EMOJI_TO_HUE } from "@blinkdisk/constants/emoji";
import { cn } from "@blinkdisk/utils/class";
import { useMemo } from "react";
import { getEmojiUrl } from "./emoji";

export type SourceCardProps = {
  emoji?: string;
  size?: number;
  type?: "directory" | "file" | "symlink";
  theme?: "light" | "dark";
  className?: string;
};

const defaultColor = "0deg 0% 39%";

export function SourceCard({
  emoji,
  className,
  type = "directory",
  theme,
  size = 20,
}: SourceCardProps) {
  const { color, emojiUrl, fillMix, strokeMix } = useMemo(() => {
    if (!emoji) {
      return {
        color: `hsl(${defaultColor})`,
        fillMix: theme === "dark" ? 34 : 18,
        strokeMix: theme === "dark" ? 52 : 30,
        emojiUrl: undefined,
      };
    }

    const url = getEmojiUrl(emoji);
    const code = url?.split("/").pop()?.replace(".svg", "") || "";
    const hue = EMOJI_TO_HUE[code as keyof typeof EMOJI_TO_HUE];
    return {
      color:
        hue !== undefined
          ? `hsl(${hue}deg 100% ${!theme ? "50%" : theme === "dark" ? "65%" : "35%"})`
          : `hsl(${defaultColor})`,
      fillMix: 18,
      strokeMix: 30,
      emojiUrl: url,
    };
  }, [emoji, theme]);
  const isFile = type === "file" || type === "symlink";

  return (
    <div
      style={{ width: `${size}rem`, aspectRatio: 1, flexShrink: 0 }}
      className={cn("rounded-md relative", className)}
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="64"
        height="64"
        viewBox="0 0 64 64"
        fill="none"
        className="w-full h-full"
        style={{ width: "100%", height: "100%" }}
      >
        <title>{isFile ? "File" : "Folder"}</title>
        {isFile ? (
          <path
            d="M16 5H37.5C40.2 5 42.8 6.1 44.7 8L54 17.3C55.9 19.2 57 21.8 57 24.5V49.5C57 54.75 52.75 59 47.5 59H16C10.48 59 6 54.52 6 49V15C6 9.48 10.48 5 16 5Z"
            fill={`color-mix(in srgb, ${color} ${fillMix}%, var(--background))`}
            stroke={`color-mix(in srgb, ${color} ${strokeMix}%, var(--background))`}
            strokeWidth="3"
            strokeLinejoin="round"
          />
        ) : (
          <path
            xmlns="http://www.w3.org/2000/svg"
            d="M61 19.5V49.39C61 51.94 59.98 54.38 58.17 56.19C56.36 57.99 53.9 59 51.33 59H12.67C10.1 59 7.64 57.99 5.83 56.19C4.02 54.38 3 51.94 3 49.39V14.61C3 12.06 4.02 9.62 5.83 7.81C7.64 6.01 10.1 5 12.67 5L22.33 5C23.93 5 25.5 5.28 26.91 5.81C28.31 6.34 29.51 7.11 30.39 8.05L33.13 10.99C33.63 11.51 34.31 11.94 35.1 12.24C35.89 12.54 36.77 12.69 37.67 12.69H51.33C53.89 12.69 56.35 13.41 58.16 14.69C59.97 15.96 60.99 17.69 61 19.5Z"
            fill={`color-mix(in srgb, ${color} ${fillMix}%, var(--background))`}
            stroke={`color-mix(in srgb, ${color} ${strokeMix}%, var(--background))`}
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        )}
      </svg>
      {emojiUrl ? (
        <img
          src={emojiUrl}
          alt={emoji}
          className={cn(
            "absolute size-[35%] left-[50%] -translate-x-1/2",
            isFile ? "bottom-[29%]" : "bottom-[27%]",
          )}
        />
      ) : null}
    </div>
  );
}
