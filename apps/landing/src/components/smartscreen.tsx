import { cn } from "@utils/class";
import { useEffect, useRef, useState } from "react";

export function SmartScreen() {
  const container = useRef<HTMLDivElement>(null);
  const tip = useRef<HTMLDivElement>(null);
  const tip2 = useRef<HTMLDivElement>(null);
  const [expanded, setExpanded] = useState(false);

  useEffect(() => {
    const run = async () => {
      if (!container.current || !tip.current || !tip2.current) return;

      tip.current.style.translate = "6rem 4rem";
      tip2.current.style.translate = "-6rem -4rem";
      await new Promise((resolve) => setTimeout(resolve, 1000));

      tip.current.style.opacity = "1";
      await new Promise((resolve) => setTimeout(resolve, 500));
      tip.current.style.translate = "-50% -50%";
      await new Promise((resolve) => setTimeout(resolve, 500));
      tip.current.style.transform = "scale(0.75)";
      await new Promise((resolve) => setTimeout(resolve, 500));
      tip.current.style.transform = "scale(1)";
      tip.current.style.opacity = "0";

      setExpanded(true);

      await new Promise((resolve) => setTimeout(resolve, 1000));

      tip2.current.style.opacity = "1";
      tip2.current.style.translate = "-6rem -4rem";
      await new Promise((resolve) => setTimeout(resolve, 500));
      tip2.current.style.translate = "-50% -50%";
      await new Promise((resolve) => setTimeout(resolve, 500));
      tip2.current.style.transform = "scale(0.75)";
      await new Promise((resolve) => setTimeout(resolve, 500));
      tip2.current.style.transform = "scale(1)";
      tip2.current.style.opacity = "0";

      container.current.style.opacity = "0";
      container.current.style.transform = "translateX(100%)";

      await new Promise((resolve) => setTimeout(resolve, 200));

      setExpanded(false);
      container.current.style.transition = "none";
      container.current.style.transform = "translateX(-100%)";
      container.current.style.transition = "all 200ms ease-in-out";

      await new Promise((resolve) => setTimeout(resolve, 200));

      container.current.style.opacity = "1";
      container.current.style.transform = "translateX(0%)";
    };

    const interval = setInterval(run, 6000);
    run();

    return () => clearInterval(interval);
  }, [container]);

  return (
    <div className="w-160 mt-12 hidden aspect-video overflow-hidden rounded-2xl bg-sky-800 text-white md:flex">
      <div
        ref={container}
        className="flex h-full w-full flex-col items-center justify-between p-8 transition-all duration-200"
      >
        <div className="flex flex-col">
          <p className="text-2xl">Windows protected your PC</p>
          <p className="mt-5 leading-relaxed text-white/70">
            Microsoft Defender SmartScreen prevented an unrecognized app from
            starting. Running this app might put your PC at risk.
          </p>
          <div className="relative mt-1 w-fit">
            <span
              className={cn(
                "leading-relaxed underline",
                expanded && "opacity-0",
              )}
            >
              More info
            </span>
            <div
              ref={tip}
              style={{ opacity: 0 }}
              className="absolute left-1/2 top-1/2 size-8 rounded-full border-2 border-yellow-500/50 bg-yellow-500/50 transition-all duration-500"
            ></div>
          </div>
          {expanded ? (
            <div className="flex flex-row gap-2 text-white/70">
              <div className="flex flex-col">
                <span>App:</span>
                <span>Publisher:</span>
              </div>
              <div className="flex flex-col">
                <span>BlinkDisk-Windows.exe</span>
                <span>Unknown publisher</span>
              </div>
            </div>
          ) : null}
        </div>
        <div className="flex w-full flex-row justify-end gap-4 text-sm">
          <div className="relative">
            <div
              className={cn(
                "bg-white px-4 py-2 font-bold text-black",
                !expanded && "opacity-0",
              )}
            >
              Run anyway
            </div>
            <div
              ref={tip2}
              style={{ opacity: 0 }}
              className="absolute left-1/2 top-1/2 size-8 rounded-full border-2 border-yellow-500/50 bg-yellow-500/50 transition-all duration-500"
            ></div>
          </div>
          <div className="bg-white px-4 py-2 font-bold text-black">
            Don&apos;t run
          </div>
        </div>
      </div>
    </div>
  );
}
