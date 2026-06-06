import { EMOJI_TO_HUE } from "@blinkdisk/constants/emoji";
import { cn } from "@blinkdisk/utils/class";
import { useMemo } from "react";
import { parse } from "twemoji-parser";

export type FolderCardProps = {
  emoji: string | undefined;
  size?: number;
  theme?: "light" | "dark";
  className?: string;
};

const defaultColor = "0deg 0% 39%";

export function FolderCard({
  emoji = "📁",
  className,
  theme,
  size = 20,
}: FolderCardProps) {
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
        <title>Folder</title>
        <path
          xmlns="http://www.w3.org/2000/svg"
          d="M61 19.5V49.3923C61 51.9404 59.9817 54.3842 58.169 56.186C56.3564 57.9878 53.8979 59 51.3344 59H12.6656C10.1021 59 7.64365 57.9878 5.831 56.186C4.01834 54.3842 3 51.9404 3 49.3923V14.6077C3 12.0596 4.01834 9.61582 5.831 7.81403C7.64365 6.01224 10.1021 5 12.6656 5L22.3344 5C23.9293 4.99926 25.4998 5.27735 26.9056 5.80947C28.3115 6.3416 29.5091 7.11122 30.3917 8.04972L33.1286 10.9865C33.6305 11.5117 34.3071 11.9418 35.0992 12.2391C35.8912 12.5365 36.7745 12.6919 37.6715 12.6918H51.3344C53.8927 12.6924 56.3465 13.4093 58.1581 14.6853C59.9698 15.9614 60.9917 17.6927 61 19.5Z"
          fill={`color-mix(in srgb, hsl(${color}) 18%, var(--background))`}
          stroke={`color-mix(in srgb, hsl(${color}) 30%, var(--background))`}
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
      {emojiUrl ? (
        <img
          src={emojiUrl}
          alt={emoji}
          className={cn(
            "absolute bottom-[27%] size-[35%] left-[50%] -translate-x-1/2",
          )}
        />
      ) : null}
    </div>
  );
}
