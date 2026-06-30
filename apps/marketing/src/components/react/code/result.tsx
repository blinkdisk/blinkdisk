import { useIsMobile } from "@blinkdisk/hooks/use-mobile";
import { Button } from "@blinkdisk/ui/button";
import { Switch } from "@blinkdisk/ui/switch";
import { cn } from "@blinkdisk/utils/class";
import type {
  CodeStatsFile,
  CodeStatsRepository,
} from "@marketing/components/react/code/types";
import render from "dom-to-image";
import {
  AlignLeftIcon,
  ArrowLeftIcon,
  DownloadIcon,
  FilesIcon,
  FoldersIcon,
  ShareIcon,
  TypeIcon,
} from "lucide-react";
import type { Ref } from "react";
import { useCallback, useMemo, useRef, useState } from "react";
import { toast } from "sonner";

type CodeStatsResultProps = {
  files: CodeStatsFile[];
  repository?: CodeStatsRepository | null;
  reset: () => void;
};

export function CodeStatsResult({
  files,
  repository,
  reset,
}: CodeStatsResultProps) {
  const ref = useRef<HTMLDivElement>(null);
  const mobile = useIsMobile();

  const [excludedLanguages, setExcludedLanguages] = useState<string[]>([]);

  const [downloadLoading, setDownloadLoading] = useState(false);
  const [shareLoading, setShareLoading] = useState(false);

  const languages = useMemo(() => {
    const obj = files.reduce(
      (acc, file) => {
        acc[file.language] = (acc[file.language] || 0) + file.lines;
        return acc;
      },
      {} as Record<string, number>,
    );

    return Object.entries(obj)
      .map(([language, lines]) => ({
        language,
        lines,
      }))
      .sort((a, b) => b.lines - a.lines);
  }, [files]);

  const includedFiles = useMemo(() => {
    return files.filter((file) => !excludedLanguages.includes(file.language));
  }, [files, excludedLanguages]);

  const stats = useMemo(() => {
    const uniqueFolders = new Set();

    const stats = includedFiles.reduce(
      (acc, file) => {
        const parts = file.path.split("/");
        parts.pop();

        let current = "";
        for (const part of parts) {
          current = current ? `${current}/${part}` : part;
          uniqueFolders.add(current);
        }

        acc.files++;
        acc.lines += file.lines;
        acc.characters += file.characters;
        return acc;
      },
      {
        files: 0,
        lines: 0,
        characters: 0,
      },
    );

    return { ...stats, folders: uniqueFolders.size };
  }, [includedFiles]);

  const generateImage = useCallback(async () => {
    if (!ref.current) return null;
    return await render.toJpeg(ref.current, { quality: 0.95 });
  }, []);

  const download = useCallback(async () => {
    setDownloadLoading(true);

    try {
      const image = await generateImage();
      if (!image) return;

      const link = document.createElement("a");
      link.download = `${repository ? `${repository.provider}-${repository.owner}-${repository.name}` : "code"}.jpeg`;
      link.href = image;
      link.click();

      toast.success("Successfully downloaded image", {
        description: "You can share it with anyone you want.",
      });
    } catch {
      toast.error("Failed to generate image", {
        description: "Please manually create a screenshot instead.",
      });
    }

    setDownloadLoading(false);
  }, [repository, generateImage]);

  const share = useCallback(async () => {
    setShareLoading(true);

    try {
      if (!navigator.share || !navigator.canShare)
        throw new Error("Share not supported");

      const image = await generateImage();
      if (!image) throw new Error("Failed to generate image");

      const response = await fetch(image);
      const blob = await response.blob();
      const file = new File([blob], "stats.jpg", { type: "image/jpeg" });

      await navigator.share({
        url: "https://blinkdisk.com/code",
        files: [file],
      });
    } catch (e: unknown) {
      const error = e instanceof Error || e instanceof DOMException ? e : null;
      if (error?.name === "AbortError") return;

      toast.error("Failed to share image", {
        description: "Please manually create a screenshot instead.",
      });
    }

    setShareLoading(false);
  }, [generateImage]);

  return (
    <>
      <div className="sm:w-130 flex w-[80vw] flex-col gap-4">
        <div className="flex items-center justify-between">
          <Button
            variant="ghost"
            onClick={() => reset()}
            size={mobile ? "sm" : "default"}
          >
            <ArrowLeftIcon /> Back
          </Button>
          <div className="flex items-center gap-2">
            <Button
              variant={"share" in navigator ? "outline" : "default"}
              onClick={download}
              loading={downloadLoading}
              size={mobile ? "sm" : "default"}
            >
              <DownloadIcon />
              Download
            </Button>
            {"share" in navigator ? (
              <Button
                onClick={share}
                loading={shareLoading}
                size={mobile ? "sm" : "default"}
              >
                <ShareIcon />
                Share
              </Button>
            ) : null}
          </div>
        </div>
        <div className="w-full overflow-hidden rounded-3xl border">
          <Card stats={stats} repository={repository} responsive />
        </div>
        <div className="fixed size-0 overflow-hidden">
          <div className="w-130">
            <Card ref={ref} stats={stats} repository={repository} />
          </div>
        </div>
      </div>
      <div className="sm:w-100 mt-24 flex max-w-[80vw] flex-col">
        <p className="text-center text-2xl font-bold sm:text-3xl">
          Included Languages
        </p>
        <p className="text-muted-foreground text-center text-sm sm:text-base">
          Select all languages you want to include.
        </p>
        <div className="mt-8 flex flex-col gap-2">
          {languages.map(({ language, lines }) => (
            <div
              key={language}
              className="flex items-center justify-between gap-2"
            >
              <label htmlFor={language} className="select-none">
                {language}{" "}
                <span className="text-muted-foreground">
                  ({lines.toLocaleString()} Lines)
                </span>
              </label>
              <Switch
                id={language}
                name={language}
                checked={!excludedLanguages.includes(language)}
                onCheckedChange={(to) =>
                  setExcludedLanguages((languages) =>
                    to
                      ? languages.filter((l) => l !== language)
                      : [...languages, language],
                  )
                }
              />
            </div>
          ))}
        </div>
      </div>
    </>
  );
}

type CardProps = {
  stats: {
    lines: number;
    files: number;
    folders: number;
    characters: number;
  };
  repository?: CodeStatsRepository | null;
  responsive?: boolean;
  ref?: Ref<HTMLDivElement>;
};

function Card({ stats, repository, responsive, ref }: CardProps) {
  return (
    <div ref={ref} className="bg-secondary flex w-full flex-col gap-4 p-6">
      {repository ? (
        <div className="flex items-center gap-3">
          {repository.provider === "github" ? (
            <svg viewBox="0 0 100 100" fill="currentColor" className="size-5">
              <title>GitHub</title>
              <path d="M50 5C25.15 5 5 25.15 5 50C5 69.98 18.21 86.89 36.2 92.84C38.44 93.26 39.28 91.89 39.28 90.7C39.28 89.63 39.24 86.15 39.22 82.18C27.07 84.71 24.44 76.96 24.44 76.96C22.4 71.82 19.46 70.45 19.46 70.45C15.37 67.66 19.75 67.72 19.75 67.72C24.26 68.04 26.62 72.34 26.62 72.34C30.61 79.21 36.99 77.36 39.39 76.22C39.8 73.24 40.99 71.2 42.31 70.1C32.48 68.98 22.17 65.1 22.17 47.77C22.17 42.9 23.92 38.9 26.73 35.74C26.26 34.62 24.73 30.04 27.16 23.83C27.16 23.83 30.91 22.64 39.15 28.46C42.71 27.48 46.57 26.99 50.42 26.97C54.27 27 58.12 27.48 61.69 28.47C69.92 22.65 73.66 23.84 73.66 23.84C76.1 30.05 74.57 34.63 74.1 35.75C76.93 38.9 78.65 42.91 78.65 47.78C78.65 65.15 68.32 68.97 58.46 70.06C60.11 71.46 61.59 74.21 61.59 78.43C61.59 84.46 61.54 89.32 61.54 90.7C61.54 91.9 62.36 93.28 64.64 92.83C82.81 86.87 96 69.97 96 50C96 25.15 75.85 5 50 5Z" />
            </svg>
          ) : (
            <svg viewBox="0 0 100 100" fill="currentColor" className="size-5">
              <title>GitLab</title>
              <path d="M95.88 39.48L95.79 39.23L82.39 2.95C82.16 2.37 81.76 1.87 81.25 1.52C80.73 1.18 80.13 1 79.51 0.99C78.89 0.98 78.29 1.15 77.76 1.48C77.24 1.82 76.83 2.29 76.57 2.86L67.41 26.21H32.59L23.43 2.86C23.18 2.29 22.76 1.81 22.25 1.47C21.72 1.14 21.11 0.97 20.5 0.98C19.88 0.99 19.28 1.17 18.76 1.51C18.24 1.86 17.85 2.36 17.62 2.94L4.2 39.22L4.12 39.46C2.42 44.09 2.08 49.13 3.16 53.95C4.23 58.77 6.67 63.17 10.17 66.64L10.2 66.67L10.3 66.75L32.32 83.58L43.23 92.01L49.93 97.18C50.56 97.66 51.33 97.93 52.12 97.93C52.91 97.93 53.67 97.66 54.31 97.18L61.01 92.01L71.92 83.58L89.79 66.69L89.83 66.64C93.32 63.18 95.76 58.78 96.83 53.97C97.91 49.15 97.58 44.12 95.88 39.5V39.48Z" />
            </svg>
          )}
          <p className="text-lg">
            {repository.owner} <span className="opacity-50">/</span>{" "}
            {repository.name}
          </p>
        </div>
      ) : null}
      <div
        className={cn(
          "flex w-full gap-4",
          responsive ? "flex-col sm:flex-row" : "flex-row",
        )}
      >
        <Stat
          icon={<AlignLeftIcon />}
          title="Lines of Code"
          value={stats.lines.toLocaleString()}
          className={responsive ? "sm:w-7/12" : "w-7/12"}
        />
        <Stat
          icon={<FilesIcon />}
          title="Files"
          value={stats.files.toLocaleString()}
          className={responsive ? "sm:w-5/12" : "w-5/12"}
        />
      </div>
      <div
        className={cn(
          "flex w-full gap-4",
          responsive ? "flex-col sm:flex-row" : "flex-row",
        )}
      >
        <Stat
          icon={<FoldersIcon />}
          title="Folders"
          value={stats.folders.toLocaleString()}
          className={responsive ? "sm:w-5/12" : "w-5/12"}
        />
        <Stat
          icon={<TypeIcon />}
          title="Characters of Code"
          value={stats.characters.toLocaleString()}
          className={responsive ? "sm:w-7/12" : "w-7/12"}
        />
      </div>
      <div
        className={cn(
          "flex items-center justify-between py-1",
          responsive ? "flex-col sm:flex-row" : "flex-row",
        )}
      >
        <p className="opacity-70">Your codebase, by the numbers.</p>
        <p>blinkdisk.com/code</p>
      </div>
    </div>
  );
}

type StatProps = {
  icon: React.ReactNode;
  title: string;
  description?: string;
  value: string;
  className?: string;
};

function Stat({ icon, title, description, value, className }: StatProps) {
  return (
    <div className={cn("bg-card rounded-xl border p-6", className)}>
      <p className="text-lg leading-none tracking-tight [&>svg]:mr-1 [&>svg]:inline-block [&>svg]:size-4">
        {icon} {title}
      </p>
      <p className="mt-2 font-mono text-4xl font-bold tracking-tighter">
        {value}
      </p>
      {description && (
        <p className="text-muted-foreground mt-2 text-xs">{description}</p>
      )}
    </div>
  );
}
