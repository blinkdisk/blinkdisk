import { exampleFolders } from "@config/folder";
import { Folder } from "@landing/components/folder";
import { Loader } from "@ui/loader";
import { AnimatePresence, motion } from "framer-motion";
import { CheckIcon } from "lucide-react";
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

export function SetupAnimation() {
  const [folders, setFolders] = useState<typeof exampleFolders>([]);
  const [completed, setCompleted] = useState(false);

  const [style, setStyle] = useState<React.CSSProperties | undefined>(
    undefined,
  );

  useEffect(() => {
    start();
  }, []);

  async function start() {
    while (true) {
      await animate();
    }
  }

  async function animate() {
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
          <Folder folder={{ ...folder, emoji: "📁" }} />
          <div className="relative flex size-6 items-center justify-center">
            <AnimatePresence>
              {!completed ? (
                <motion.div
                  key="progress"
                  initial={{
                    scale: 1,
                    opacity: 1,
                  }}
                  exit={{
                    scale: 0.5,
                    opacity: 0,
                  }}
                  transition={{
                    duration: 0.5,
                    delay: index * 0.2,
                  }}
                >
                  <Loader />
                </motion.div>
              ) : (
                <motion.div
                  key="icon"
                  initial={{
                    scale: 0.5,
                    opacity: 0,
                  }}
                  animate={{
                    scale: 1,
                    opacity: 1,
                  }}
                  exit={{
                    scale: 0.5,
                    opacity: 0,
                  }}
                  transition={{
                    duration: 0.2,
                    delay: index * 0.2 + 0.2,
                  }}
                  style={{
                    translateX: "-50%",
                    translateY: "-50%",
                  }}
                  className="absolute left-1/2 top-1/2"
                >
                  <CheckIcon className="size-5 text-lime-500" />
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      ))}
    </div>
  );
}
