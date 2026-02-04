import { exampleFolders } from "@config/folder";
import { EmojiCard } from "@ui/emoji-card";
import { CheckIcon, LoaderIcon } from "lucide-react";
import { useEffect, useState } from "react";

function pickRandomFolders(): typeof exampleFolders {
  const result = new Set<(typeof exampleFolders)[number]>();

  while (result.size < 3) {
    const randomIndex = Math.floor(Math.random() * exampleFolders.length);
    result.add(exampleFolders[randomIndex]!);
  }

  return Array.from(result);
}

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export default function SetupAnimation() {
  const [folders, setFolders] = useState<typeof exampleFolders>([]);
  const [completed, setCompleted] = useState(false);
  const [style, setStyle] = useState<React.CSSProperties | undefined>(undefined);

  useEffect(() => {
    let mounted = true;

    async function animate() {
      while (mounted) {
        setCompleted(false);

        setStyle({
          transform: "translateX(30%)",
          opacity: 0,
        });

        setFolders(pickRandomFolders());

        await sleep(350);

        setStyle({
          transform: "translateX(0%)",
          opacity: 1,
        });

        await sleep(1500);

        setCompleted(true);

        await sleep(2000);

        setStyle({
          transform: "translateX(-30%)",
          opacity: 0,
        });

        await sleep(350);
      }
    }

    animate();

    return () => {
      mounted = false;
    };
  }, []);

  return (
    <div className="flex h-full w-full flex-col items-start justify-between p-8">
      {folders.map((folder, index) => (
        <div
          key={folder.name}
          style={{
            ...(style ?? {}),
            transitionDelay: `${index * 50}ms`,
          }}
          className="flex w-full items-center justify-between transition-all duration-300"
        >
          <div className="flex items-center gap-3">
            <EmojiCard emoji={folder.emoji} size="sm" />
            <div className="flex flex-col">
              <p className="text-base font-semibold">{folder.name}</p>
              <p className="text-muted-foreground text-xs">
                {folder.files.toLocaleString()} Files
              </p>
            </div>
          </div>
          <div className="relative flex size-6 items-center justify-center">
            {!completed ? (
              <LoaderIcon className="size-5 animate-spin text-gray-400" />
            ) : (
              <CheckIcon
                className="size-5 text-lime-500 transition-all duration-200"
                style={{
                  transitionDelay: `${index * 200 + 200}ms`,
                }}
              />
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
