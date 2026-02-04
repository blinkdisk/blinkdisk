import { useCalendar } from "@marketing/hooks/use-calendar";
import { useClipboard } from "@marketing/hooks/use-clipboard";
import { useLogsnag } from "@marketing/hooks/use-logsnag";
import { usePlatform } from "@marketing/hooks/use-platform";
import type { Architecture } from "@marketing/utils/architecture";
import { getArchitectureFromCpu } from "@marketing/utils/architecture";
import {
  getDownloadUrl,
  linux,
  mac,
  windows,
} from "@marketing/utils/downloads";
import type { Platform } from "@marketing/utils/platform";
import Confetti from "js-confetti";
import {
  CalendarIcon,
  ChevronDownIcon,
  CopyIcon,
  DownloadIcon,
  ShareIcon,
} from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";

declare global {
  interface Window {
    endorsely_referral?: string;
  }
}

type Extension = "AppImage" | "deb" | "rpm";

export default function DownloadClient() {
  const { logsnag } = useLogsnag();
  const { copy } = useClipboard();
  const { addToCalendar } = useCalendar();
  const { platform: detectedPlatform, cpu, isMobile } = usePlatform();

  const [platform, setPlatform] = useState<Platform | undefined>(undefined);
  const [architecture, setArchitecture] = useState<Architecture | undefined>(
    undefined,
  );
  const [extension, setExtension] = useState<Extension | undefined>("AppImage");
  const [calendarOpen, setCalendarOpen] = useState(false);

  const detectedArchitecture = useMemo(() => {
    if (cpu === null) return null;
    return getArchitectureFromCpu(cpu.architecture);
  }, [cpu]);

  const autoDownloadFile = useMemo(() => {
    if (
      detectedPlatform === null ||
      detectedArchitecture === null ||
      isMobile === null
    )
      return null;

    if (isMobile) return null;
    if (detectedPlatform === "macos") return mac.dmg;
    if (detectedPlatform === "linux") return null;

    return windows.exe;
  }, [isMobile, detectedPlatform, detectedArchitecture]);

  const selectedFile = useMemo(() => {
    if (!platform || !architecture) return null;

    if (platform === "windows") return windows.exe;
    if (platform === "macos") return mac.dmg;

    if (!extension) return null;

    return linux[extension][architecture];
  }, [platform, architecture, extension]);

  const onDownloadStart = useCallback(
    (file: string) => {
      const confetti = new Confetti();

      confetti.addConfetti({
        confettiNumber: 100,
      });

      const logged = window.localStorage.getItem("download.logged");
      if (!logged) {
        localStorage.setItem("download.logged", "true");

        logsnag({
          channel: "downloads",
          title: "Download started",
          description: `${file} just got downloaded.`,
          icon: "⬇️",
        });
      }
    },
    [logsnag],
  );

  useEffect(() => {
    if (autoDownloadFile === null) return;

    const a = document.createElement("a");

    a.href = getDownloadUrl(autoDownloadFile);
    a.download = "";
    a.style.display = "none";

    document.body.appendChild(a);
    a.click();

    onDownloadStart(autoDownloadFile);
  }, [onDownloadStart, autoDownloadFile]);

  const remind = useCallback(
    (type: "google" | "outlook" | "other") => {
      const start = new Date();
      start.setDate(start.getDate() + 1);

      const end = new Date(start);
      end.setHours(end.getHours() + 1);

      addToCalendar({
        title: "Download BlinkDisk on my desktop",
        description:
          "Download the BlinkDisk desktop app from https://blinkdisk.com/download",
        start,
        end,
        type,
      });
      setCalendarOpen(false);
    },
    [addToCalendar],
  );

  useEffect(() => {
    if (detectedPlatform) setPlatform(detectedPlatform);
    else setPlatform("windows");
  }, [detectedPlatform]);

  useEffect(() => {
    if (detectedArchitecture) setArchitecture(detectedArchitecture);
  }, [detectedArchitecture]);

  return (
    <div className="py-page flex min-h-screen flex-col items-center">
      <div className="mt-auto"></div>
      {autoDownloadFile ? (
        <>
          <h1 className="max-w-[80vw] text-4xl font-bold sm:text-5xl">
            Download started
          </h1>
          <p className="text-muted-foreground mt-2 max-w-[80vw] text-center text-sm sm:max-w-md">
            Your BlinkDisk installer download has started.{" "}
            {platform === "windows"
              ? "If you experience any issues during the installation, you can follow the tutorial below."
              : "Once the download is complete, open the file and follow the installation instructions."}
          </p>
          {platform === "windows" ? (
            <SmartScreen />
          ) : (
            <a
              href={getDownloadUrl(autoDownloadFile)}
              download
              onClick={() => onDownloadStart(autoDownloadFile)}
              className="bg-primary text-primary-foreground hover:bg-primary/90 mt-12 inline-flex h-12 items-center justify-center gap-2 rounded-md px-6 text-sm font-medium transition-colors"
            >
              <DownloadIcon className="size-4" />
              Download again
            </a>
          )}
          <h2 className="mt-20 text-center text-2xl font-bold">
            Didn't get the right file?
          </h2>
          <p className="text-muted-foreground mt-2 max-w-80 text-center text-sm">
            If the automatic download didn't match your device, you can pick the
            correct file below.
          </p>
        </>
      ) : isMobile ? (
        <>
          <h1 className="max-w-[90vw] text-center text-4xl font-bold">
            Download BlinkDisk on your desktop
          </h1>
          <p className="text-muted-foreground mt-4 max-w-[90vw] text-center text-sm">
            We detected that you're on a mobile device, but BlinkDisk is
            currently only available on desktop.
          </p>

          <div className="sm:w-sm mt-12 flex w-[80vw] flex-col items-center gap-4">
            {"share" in navigator ? (
              <button
                onClick={async () => {
                  try {
                    if (!navigator.share || !navigator.canShare)
                      throw new Error("Share not supported");

                    await navigator.share({
                      url: window.location.href,
                    });
                  } catch (e: unknown) {
                    const error = e instanceof Error ? e : null;
                    if (error?.toString().includes("AbortError")) return;

                    toast.error("Failed to share link", {
                      description:
                        "Please try to manually share this website instead.",
                    });
                  }
                }}
                className="bg-primary text-primary-foreground hover:bg-primary/90 inline-flex h-10 w-full items-center justify-center gap-2 rounded-md px-4 text-sm font-medium transition-colors"
              >
                <ShareIcon className="size-4" />
                Share
              </button>
            ) : null}
            <div className="flex w-full items-center gap-2">
              <div className="relative flex-1">
                <button
                  onClick={() => setCalendarOpen(!calendarOpen)}
                  className="bg-secondary hover:bg-secondary/80 border-border inline-flex h-10 w-full items-center justify-center gap-2 rounded-md border px-4 text-sm font-medium transition-colors"
                >
                  <CalendarIcon className="size-4" />
                  Remind me
                  <ChevronDownIcon className="size-4" />
                </button>
                {calendarOpen && (
                  <div className="bg-card absolute left-0 top-12 z-10 w-full rounded-md border p-1 shadow-lg">
                    <button
                      onClick={() => remind("google")}
                      className="hover:bg-secondary w-full rounded px-3 py-2 text-left text-sm"
                    >
                      Google Calendar
                    </button>
                    <button
                      onClick={() => remind("outlook")}
                      className="hover:bg-secondary w-full rounded px-3 py-2 text-left text-sm"
                    >
                      Outlook
                    </button>
                    <button
                      onClick={() => remind("other")}
                      className="hover:bg-secondary w-full rounded px-3 py-2 text-left text-sm"
                    >
                      Other
                    </button>
                  </div>
                )}
              </div>
              <button
                onClick={async () => {
                  const success = await copy(window.location.href);

                  if (success)
                    toast.success("Copied link to clipboard", {
                      description:
                        "You can now share this link with your desktop device.",
                    });
                  else
                    toast.error("Failed to copy link to clipboard", {
                      description: "Please try to copy it manually instead.",
                    });
                }}
                className="bg-secondary hover:bg-secondary/80 border-border inline-flex h-10 flex-1 items-center justify-center gap-2 rounded-md border px-4 text-sm font-medium transition-colors"
              >
                <CopyIcon className="size-4" />
                Copy link
              </button>
            </div>
          </div>

          <h2 className="mt-30 text-center text-3xl font-bold sm:text-4xl">
            Download anyway
          </h2>
          <p className="text-muted-foreground mt-2 max-w-[80vw] text-center text-sm sm:max-w-md">
            If you want to download BlinkDisk anyway, please select the correct
            file for your device below.
          </p>
        </>
      ) : (
        <>
          <h1 className="text-center text-3xl font-bold sm:text-4xl">
            Download BlinkDisk
          </h1>
          <p className="text-muted-foreground mt-2 max-w-[80vw] text-center text-sm sm:max-w-md">
            Please select the correct file for your device below.
          </p>
        </>
      )}
      <div className="mt-8 flex flex-col items-center gap-4">
        <div className="flex flex-col gap-1">
          <p className="text-muted-foreground text-sm">Operating System</p>
          <div className="bg-secondary flex rounded-lg p-1">
            {(["windows", "macos", "linux"] as const).map((p) => (
              <button
                key={p}
                onClick={() => {
                  setPlatform(p);
                  if (p === "macos" && architecture === "armv7l")
                    setArchitecture("x86_64");
                }}
                className={`inline-flex items-center gap-1 rounded-md px-4 py-2 text-sm font-medium transition-colors ${
                  platform === p
                    ? "bg-background shadow"
                    : "hover:bg-background/50"
                }`}
              >
                {p === "windows" && <WindowsIcon />}
                {p === "macos" && <MacosIcon />}
                {p === "linux" && <LinuxIcon />}
                {p === "windows"
                  ? "Windows"
                  : p === "macos"
                    ? "macOS"
                    : "Linux"}
              </button>
            ))}
          </div>
        </div>
        {platform === "linux" ? (
          <div className="flex w-full flex-col gap-1">
            <p className="text-muted-foreground text-sm">Architecture</p>
            <div className="bg-secondary flex w-full rounded-lg p-1">
              {(["x86_64", "arm64", "armv7l"] as const).map((a) => (
                <button
                  key={a}
                  onClick={() => setArchitecture(a)}
                  className={`flex-1 rounded-md px-4 py-2 text-sm font-medium transition-colors ${
                    architecture === a
                      ? "bg-background shadow"
                      : "hover:bg-background/50"
                  }`}
                >
                  {a}
                </button>
              ))}
            </div>
          </div>
        ) : null}
        {platform === "linux" ? (
          <div className="flex w-full flex-col gap-1">
            <p className="text-muted-foreground text-sm">File Type</p>
            <div className="bg-secondary flex w-full rounded-lg p-1">
              {(["AppImage", "deb", "rpm"] as const).map((e) => (
                <button
                  key={e}
                  onClick={() => setExtension(e)}
                  className={`flex-1 rounded-md px-4 py-2 text-sm font-medium transition-colors ${
                    extension === e
                      ? "bg-background shadow"
                      : "hover:bg-background/50"
                  }`}
                >
                  {e}
                </button>
              ))}
            </div>
          </div>
        ) : null}
        {selectedFile ? (
          <a
            href={getDownloadUrl(selectedFile)}
            download
            onClick={() => onDownloadStart(selectedFile)}
            className={`mt-4 inline-flex h-10 w-full items-center justify-center gap-2 rounded-md px-4 text-sm font-medium transition-colors ${
              autoDownloadFile || isMobile
                ? "bg-secondary hover:bg-secondary/80 border-border border"
                : "bg-primary text-primary-foreground hover:bg-primary/90"
            }`}
          >
            <DownloadIcon className="size-4" />
            Download
          </a>
        ) : null}
      </div>
      <div className="mb-auto"></div>
    </div>
  );
}

function WindowsIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="currentColor"
      className="mr-1"
    >
      <path d="M0 12v-8.646l10-1.355v10.001h-10zm11 0h13v-12l-13 1.807v10.193zm-1 1h-10v7.646l10 1.355v-9.001zm1 0v9.194l13 1.806v-11h-13z" />
    </svg>
  );
}

function MacosIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="currentColor"
      className="mr-1"
    >
      <path d="M22 17.607c-.786 2.28-3.139 6.317-5.563 6.361-1.608.031-2.125-.953-3.963-.953-1.837 0-2.412.923-3.932.983-2.572.099-6.542-5.827-6.542-10.995 0-4.747 3.308-7.1 6.198-7.143 1.55-.028 3.014 1.045 3.959 1.045.949 0 2.727-1.29 4.596-1.101.782.033 2.979.315 4.389 2.377-3.741 2.442-3.158 7.549.858 9.426zm-5.222-17.607c-2.826.114-5.132 3.079-4.81 5.531 2.612.203 5.118-2.725 4.81-5.531z" />
    </svg>
  );
}

function LinuxIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="currentColor"
      className="mr-1"
    >
      <path d="M20.581 19.049c-.55-.446-.336-1.431-.907-1.917.553-3.365-.997-6.331-2.845-8.232-1.551-1.595-1.051-3.147-1.051-4.49 0-2.146-.881-4.41-3.55-4.41-2.853 0-3.635 2.38-3.663 3.738-.068 3.262.659 4.11-1.25 6.484-2.246 2.793-2.577 5.579-2.07 7.057-.237.276-.557.582-1.155.835-1.652.72-.441 1.925-.898 2.78-.13.243-.192.497-.192.74 0 .75.596 1.399 1.679 1.302 1.461-.13 2.809.905 3.681.905.77 0 1.402-.438 1.696-1.041 1.377-.339 3.077-.296 4.453.059.247.691.917 1.141 1.662 1.141 1.631 0 1.945-1.849 3.816-2.475.674-.225 1.013-.879 1.013-1.488 0-.39-.139-.761-.419-.988z" />
    </svg>
  );
}

function SmartScreen() {
  return (
    <div className="w-160 mt-12 hidden aspect-video overflow-hidden rounded-2xl bg-sky-800 text-white md:flex">
      <div className="flex h-full w-full flex-col items-center justify-between p-8">
        <div className="flex flex-col">
          <p className="text-2xl">Windows protected your PC</p>
          <p className="mt-5 leading-relaxed text-white/70">
            Microsoft Defender SmartScreen prevented an unrecognized app from
            starting. Running this app might put your PC at risk.
          </p>
          <div className="relative mt-1 w-fit">
            <span className="leading-relaxed underline">More info</span>
          </div>
          <div className="mt-4 flex flex-row gap-2 text-white/70">
            <div className="flex flex-col">
              <span>App:</span>
              <span>Publisher:</span>
            </div>
            <div className="flex flex-col">
              <span>BlinkDisk-Windows.exe</span>
              <span>
                AT, Vorarlberg, Feldkirch, Open Source Developer, "Open Source
                Developer, Paul Köck"
              </span>
            </div>
          </div>
        </div>
        <div className="flex w-full flex-row justify-end gap-4 text-sm">
          <div className="bg-white px-4 py-2 font-bold text-black">
            Run anyway
          </div>
          <div className="bg-white px-4 py-2 font-bold text-black">
            Don't run
          </div>
        </div>
      </div>
    </div>
  );
}
