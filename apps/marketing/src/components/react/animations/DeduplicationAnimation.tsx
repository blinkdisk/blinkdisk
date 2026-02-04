import { exampleFolders } from "@config/folder";
import { EmojiCard } from "@ui/emoji-card";
import { useMemo } from "react";

export default function DeduplicationAnimation() {
  const files = 8472;

  const marquees = useMemo(() => {
    const half = Math.round(exampleFolders.length / 2);

    return [
      exampleFolders.slice(0, half),
      exampleFolders.slice(half, exampleFolders.length),
    ];
  }, []);

  return (
    <div className="relative flex h-full w-full items-center justify-between p-6">
      <div className="flex w-1/2 flex-col gap-6 overflow-hidden">
        <Marquee folders={marquees[0]!} duration={20} direction="right" />
        <Marquee folders={marquees[1]!} duration={30} direction="left" />
      </div>
      <div className="flex w-1/2 items-center justify-center">
        <div className="flex items-center gap-3">
          <EmojiCard emoji="📦" size="sm" />
          <div className="flex flex-col">
            <p className="text-base font-semibold">Backup</p>
            <p className="text-muted-foreground text-xs">
              {files.toLocaleString()} Files
            </p>
          </div>
        </div>
      </div>
      <div className="border-border absolute left-1/2 top-1/2 h-[60%] -translate-y-1/2 border-l-2"></div>
    </div>
  );
}

type MarqueeProps = {
  folders: {
    name: string;
    emoji: string;
    size: number;
    files: number;
  }[];
  duration: number;
  direction: "left" | "right";
};

function Marquee({ folders, duration, direction }: MarqueeProps) {
  const animationStyle = {
    animation: `marquee-${direction} ${duration}s linear infinite`,
  };

  return (
    <div
      className="flex w-max overflow-hidden"
      style={{
        maskImage:
          "linear-gradient(to right, transparent, black 10%, black 100%)",
      }}
    >
      <div className="flex items-center gap-4" style={animationStyle}>
        {folders.map((folder) => (
          <div
            key={folder.name}
            className="flex items-center gap-2 whitespace-nowrap"
          >
            <EmojiCard emoji={folder.emoji} size="sm" />
            <span className="text-sm font-medium">{folder.name}</span>
          </div>
        ))}
        {folders.map((folder) => (
          <div
            key={`${folder.name}-dup`}
            className="flex items-center gap-2 whitespace-nowrap"
          >
            <EmojiCard emoji={folder.emoji} size="sm" />
            <span className="text-sm font-medium">{folder.name}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
