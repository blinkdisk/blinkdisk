import { exampleFolders } from "@config/folder";
import { Folder } from "@landing/components/folder";
import { useMemo } from "react";
import ReactMarquee from "react-fast-marquee";

export function DeduplicationAnimation() {
  const files = useMemo(() => {
    return Math.round(Math.random() * 5000 + 5000);
  }, []);

  const marquees = useMemo(() => {
    const half = Math.round(exampleFolders.length / 2);

    return [
      exampleFolders.slice(0, half),
      exampleFolders.slice(half, exampleFolders.length),
    ];
  }, []);

  return (
    <div className="relative flex h-full w-full items-center justify-between p-6">
      <div className="flex w-1/2 flex-col gap-6">
        <Marquee folders={marquees[0]!} speed={60} />
        <Marquee folders={marquees[1]!} speed={40} />
      </div>
      <div className="flex w-1/2 items-center justify-center">
        <Folder folder={{ emoji: "📦", name: "Backup", files }} />
      </div>
      <div className="border-border shadow2-[0_0_10px_var(--primary)] absolute left-1/2 top-1/2 h-[60%] -translate-y-1/2 border-l-2"></div>
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
  speed: number;
};

function Marquee({ folders, speed }: MarqueeProps) {
  return (
    <ReactMarquee
      speed={speed}
      style={{
        maskImage:
          "linear-gradient(to right, transparent, black 10%, black 100%)",
      }}
      direction="right"
    >
      <div className="flex items-center gap-8 pl-8">
        {folders.map((folder) => (
          <Folder key={folder.name} folder={{ ...folder, emoji: "📁" }} />
        ))}
      </div>
    </ReactMarquee>
  );
}
