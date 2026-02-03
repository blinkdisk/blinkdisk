import { useIsMobile } from "@hooks/use-mobile";
import { Dialog, DialogPanel } from "@headlessui/react";
import { DownloadIcon, PlayIcon, XIcon } from "lucide-react";
import { useState } from "react";

export default function Hero() {
  const mobile = useIsMobile();
  const [videoOpen, setVideoOpen] = useState(false);

  return (
    <div className="pt-page flex flex-col items-center justify-center pb-16 sm:pb-24">
      <div className="flex max-w-[90vw] flex-col items-center text-center md:max-w-[38rem]">
        <h1 className="animate-fade-in mt-4 text-5xl text-[2.5rem] font-bold leading-tight tracking-tight md:text-6xl">
          Secure your files
          <br className="hidden sm:block" />
          before it&apos;s too late
        </h1>
        <p
          className="text-muted-foreground animate-fade-in mt-4 text-base sm:mt-6 sm:text-lg md:text-xl md:leading-relaxed"
          style={{ animationDelay: "0.2s" }}
        >
          BlinkDisk is a desktop application that lets you effortlessly create
          backup copies of all your important files
          <span className="hidden sm:inline"> with just a few clicks</span>.
        </p>
        <div className="mt-8 flex items-center gap-3 sm:mt-12">
          <a
            href="https://github.com/blinkdisk/blinkdisk"
            target="_blank"
            rel="noopener noreferrer"
            className="animate-fade-in bg-secondary hover:bg-secondary/80 border-border flex items-center justify-center rounded-md border transition-colors"
            style={{
              animationDelay: "0.4s",
              width: mobile ? "48px" : "56px",
              height: mobile ? "48px" : "56px",
            }}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width={mobile ? "20" : "24"}
              height={mobile ? "20" : "24"}
              viewBox="0 0 24 24"
              fill="currentColor"
            >
              <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
            </svg>
          </a>
          <a
            href="/download"
            className="animate-fade-in bg-primary text-primary-foreground hover:bg-primary/90 inline-flex items-center justify-center gap-2 rounded-md font-medium transition-colors"
            style={{
              animationDelay: "0.35s",
              height: mobile ? "48px" : "56px",
              paddingLeft: mobile ? "1.5rem" : "2rem",
              paddingRight: mobile ? "1.5rem" : "2rem",
              fontSize: mobile ? "0.875rem" : "1rem",
            }}
          >
            <DownloadIcon className="mr-1.5 size-4 md:size-5" />
            Download for free
          </a>
        </div>
      </div>
      <div
        className="animate-fade-in lg:rounded-4xl relative mt-16 cursor-pointer overflow-hidden rounded-xl sm:mt-20 sm:rounded-2xl md:rounded-3xl"
        style={{ animationDelay: "0.5s" }}
        onClick={() => setVideoOpen(true)}
      >
        <img
          src="/screenshots/light.png"
          alt="Screenshot of the BlinkDisk desktop app"
          className="w-content border shadow dark:hidden"
        />
        <img
          src="/screenshots/dark.png"
          alt="Screenshot of the BlinkDisk desktop app"
          className="w-content hidden border shadow dark:block"
        />
        <div className="group absolute inset-0 flex items-center justify-center bg-opacity-0 transition-colors hover:bg-black/10">
          <div className="bg-foreground/20 border-foreground/20 sm:size-18 lg:size-22 flex size-16 items-center justify-center rounded-full border-2 shadow-2xl transition-transform group-hover:scale-110 md:size-20">
            <PlayIcon fill="currentColor" className="text-foreground size-5/12" />
          </div>
        </div>
      </div>

      <Dialog open={videoOpen} onClose={() => setVideoOpen(false)}>
        <div
          className="fixed inset-0 bg-black/50"
          style={{ zIndex: 1003 }}
          aria-hidden="true"
        />
        <div
          className="fixed inset-0 flex items-center justify-center p-4"
          style={{ zIndex: 1004 }}
        >
          <DialogPanel className="relative max-w-[90vw] xl:!max-w-6xl">
            <button
              onClick={() => setVideoOpen(false)}
              className="bg-foreground/20 hover:bg-foreground/30 absolute -right-2 -top-2 z-10 flex size-8 items-center justify-center rounded-full transition-colors"
            >
              <XIcon className="text-background size-5" />
            </button>
            <div className="relative aspect-video w-full overflow-hidden rounded-lg sm:rounded-xl md:!rounded-2xl">
              <iframe
                width="100%"
                height="100%"
                src="https://www.youtube.com/embed/wAKE0aHJptM?autoplay=1"
                title="YouTube video player"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                referrerPolicy="strict-origin-when-cross-origin"
                allowFullScreen
              />
            </div>
          </DialogPanel>
        </div>
      </Dialog>
    </div>
  );
}
