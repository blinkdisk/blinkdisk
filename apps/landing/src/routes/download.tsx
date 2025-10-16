import { LinuxIcon } from "@landing/components/icons/linux";
import { MacosIcon } from "@landing/components/icons/macos";
import { WindowsIcon } from "@landing/components/icons/windows";
import { SmartScreen } from "@landing/components/smartscreen";
import { useLogsnag } from "@landing/hooks/use-logsnag";
import {
  Architecture,
  getArchitectureFromCpu,
} from "@landing/utils/architecture";
import { getDownloadUrl, linux, mac, windows } from "@landing/utils/downloads";
import { head } from "@landing/utils/head";
import { getPlatformFromOS, Platform } from "@landing/utils/platform";
import { createFileRoute } from "@tanstack/react-router";
import { Button } from "@ui/button";
import { Tabs, TabsList, TabsTrigger } from "@ui/tabs";
import Confetti from "js-confetti";
import { DownloadIcon } from "lucide-react";
import { usePostHog } from "posthog-js/react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { UAParser } from "ua-parser-js";

export const Route = createFileRoute("/download")({
  component: RouteComponent,
  head: head({
    title: "Download",
    description: "Download BlinkDisk for Windows, macOS, and Linux.",
  }),
});

type Extension = "AppImage" | "deb" | "rpm";

function RouteComponent() {
  const posthog = usePostHog();
  const { logsnag } = useLogsnag();

  const [platform, setPlatform] = useState<Platform | undefined>(undefined);
  const [architecture, setArchitecture] = useState<Architecture | undefined>(
    undefined,
  );
  const [extension, setExtension] = useState<Extension | undefined>("AppImage");

  const { cpu, os } = useMemo(() => {
    if (typeof window === "undefined") return { cpu: null, os: null };

    const userAgent = window.navigator.userAgent;
    const { cpu, os } = UAParser(userAgent);

    return { cpu, os };
  }, []);

  const detectedPlatform = useMemo(() => {
    if (os === null) return null;
    return getPlatformFromOS(os.name);
  }, [os]);

  const detectedArchitecture = useMemo(() => {
    if (cpu === null) return null;
    return getArchitectureFromCpu(cpu.architecture);
  }, [cpu]);

  const autoDownloadFile = useMemo(() => {
    if (detectedPlatform === null || detectedArchitecture === null) return null;

    if (detectedPlatform === "windows") return windows.exe;
    if (detectedPlatform === "macos") return mac.dmg;

    // Don't automatically download for Linux
    return null;
  }, [detectedPlatform, detectedArchitecture]);

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

        posthog.capture("download_started", {
          file,
          platform,
          architecture,
          extension,
        });
      }
    },
    [logsnag, platform, architecture, extension, posthog],
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

  useEffect(() => {
    if (detectedPlatform) setPlatform(detectedPlatform);
  }, [detectedPlatform]);

  useEffect(() => {
    if (detectedArchitecture) setArchitecture(detectedArchitecture);
  }, [detectedArchitecture]);

  return (
    <div className="sm:pt-50 flex min-h-screen flex-col items-center py-12 sm:pb-20">
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
            <Button
              as="a"
              size="lg"
              className="mt-12"
              href={getDownloadUrl(autoDownloadFile!)}
              onClick={() => onDownloadStart(autoDownloadFile!)}
              download
            >
              <DownloadIcon />
              Download again
            </Button>
          )}
          <h2 className="mt-20 text-center text-2xl font-bold">
            Didn’t get the right file?
          </h2>
          <p className="text-muted-foreground mt-2 max-w-80 text-center text-sm">
            If the automatic download didn’t match your device, you can pick the
            correct file below.
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
          <Tabs
            value={platform}
            onValueChange={(to) => {
              setPlatform(to as Platform);
              if (to === "macos" && architecture === "armv7l")
                setArchitecture("x86_64");
            }}
          >
            <TabsList className="[&>button]:px-4 [&_svg]:mr-1 [&_svg]:size-4">
              <TabsTrigger value="windows">
                <WindowsIcon />
                Windows
              </TabsTrigger>
              <TabsTrigger value="macos">
                <MacosIcon />
                macOS
              </TabsTrigger>
              <TabsTrigger value="linux">
                <LinuxIcon />
                Linux
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
        {platform === "linux" ? (
          <div className="flex w-full flex-col gap-1">
            <p className="text-muted-foreground text-sm">Architecture</p>
            <Tabs
              value={architecture}
              onValueChange={(to) => setArchitecture(to as Architecture)}
            >
              <TabsList className="w-full">
                <TabsTrigger value="x86_64">x86_64</TabsTrigger>
                <TabsTrigger value="arm64">arm64</TabsTrigger>
                {platform === "linux" ? (
                  <TabsTrigger value="armv7l">armv7l</TabsTrigger>
                ) : null}
              </TabsList>
            </Tabs>
          </div>
        ) : null}
        {platform === "linux" ? (
          <div className="flex w-full flex-col gap-1">
            <p className="text-muted-foreground text-sm">File Type</p>
            <Tabs
              value={extension}
              onValueChange={(to) => setExtension(to as Extension)}
              className="w-full"
            >
              <TabsList className="w-full">
                <TabsTrigger value="AppImage">AppImage</TabsTrigger>
                <TabsTrigger value="deb">deb</TabsTrigger>
                <TabsTrigger value="rpm">rpm</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
        ) : null}
        {selectedFile ? (
          <Button
            as="a"
            href={getDownloadUrl(selectedFile)}
            download
            onClick={() => onDownloadStart(selectedFile)}
            className="mt-4 w-full"
            variant={autoDownloadFile ? "outline" : "default"}
          >
            <DownloadIcon />
            Download
          </Button>
        ) : null}
      </div>
      <div className="mb-auto"></div>
    </div>
  );
}
