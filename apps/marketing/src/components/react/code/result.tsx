import { useIsMobile } from "@hooks/use-mobile";
import type { CodeStatsFile, CodeStatsRepository } from "@/components/react/code/types";
import { Button } from "@ui/button";
import { Switch } from "@ui/switch";
import { cn } from "@utils/class";
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
import { forwardRef, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";

let fontLoaded = false;
function useSpaceMonoFont() {
  const [loaded, setLoaded] = useState(fontLoaded);
  useEffect(() => {
    if (!fontLoaded) {
      import("@fontsource/space-mono/latin-400.css").then(() => {
        fontLoaded = true;
        setLoaded(true);
      });
    }
  }, []);
  return loaded;
}

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
  useSpaceMonoFont();

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
  }, [ref]);

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
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link
        rel="preconnect"
        href="https://fonts.gstatic.com"
        crossOrigin="anonymous"
      />
      <link
        href="https://fonts.googleapis.com/css2?family=Space+Mono:ital,wght@0,400;0,700;1,400;1,700&display=swap"
        rel="stylesheet"
        crossOrigin="anonymous"
      />
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
};

const Card = forwardRef<HTMLDivElement, CardProps>(
  ({ stats, repository, responsive }, ref) => {
    return (
      <div ref={ref} className="bg-secondary flex w-full flex-col gap-4 p-6">
        {repository ? (
          <div className="flex items-center gap-3">
            {repository.provider === "github" ? (
              <svg viewBox="0 0 100 100" fill="currentColor" className="size-5">
                <path d="M50 5C25.1488 5 5 25.1489 5 50C5 69.9799 18.2134 86.8878 36.1995 92.8413C38.4419 93.2603 39.2824 91.8869 39.2824 90.7034C39.2824 89.6305 39.2399 86.1466 39.2186 82.1813C27.0685 84.7142 24.4405 76.9614 24.4405 76.9614C22.4001 71.8227 19.4579 70.4493 19.4579 70.4493C15.3715 67.6601 19.7509 67.7176 19.7509 67.7176C24.2551 68.0366 26.6223 72.3373 26.6223 72.3373C30.6088 79.2115 36.9889 77.3574 39.3886 76.2208C39.7969 73.2418 40.9911 71.205 42.3114 70.0959C32.4817 68.9762 22.167 65.1001 22.167 47.7681C22.167 42.9011 23.9159 38.8996 26.7285 35.7413C26.2627 34.6216 24.7299 30.0368 27.1624 23.8252C27.1624 23.8252 30.9128 22.6374 39.1505 28.4588C42.7127 27.4816 46.5668 26.9866 50.4209 26.9654C54.275 26.9972 58.1186 27.4816 61.6914 28.4694C69.919 22.648 73.6588 23.8358 73.6588 23.8358C76.102 30.0474 74.5692 34.6322 74.1034 35.7519C76.9266 38.8996 78.6542 42.9118 78.6542 47.7787C78.6542 65.1532 68.3181 68.9656 58.4565 70.0641C60.1097 71.4588 61.5893 74.2055 61.5893 78.4318C61.5893 84.4597 61.5362 89.3161 61.5362 90.7034C61.5362 91.8976 62.3555 93.2815 64.6405 92.8307C82.8073 86.8665 96 69.969 96 50C96 25.1489 75.8512 5 50 5Z" />
              </svg>
            ) : (
              <svg viewBox="0 0 100 100" fill="currentColor" className="size-5">
                <path d="M95.876 39.4759L95.7947 39.2321L82.3907 2.94607C82.1631 2.36527 81.7648 1.86916 81.249 1.52182C80.7326 1.18158 80.1293 0.996626 79.5121 0.989043C78.8948 0.98146 78.2873 1.15168 77.7626 1.47895C77.2435 1.8154 76.8301 2.29341 76.5711 2.85813L67.4125 26.2133H32.5874L23.4289 2.85813C23.1764 2.28928 22.7648 1.80687 22.2458 1.46777C21.7211 1.14049 21.1137 0.970277 20.4964 0.977861C19.8791 0.985447 19.2758 1.1704 18.7594 1.51064C18.2446 1.86056 17.8465 2.3568 17.6176 2.93731L4.20489 39.2189L4.12351 39.4627C2.41987 44.0916 2.0842 49.1272 3.15852 53.9497C4.23284 58.7723 6.66979 63.1728 10.167 66.6384L10.2047 66.6739L10.2951 66.7529L32.3152 83.5776L43.2256 92.0062L49.9269 97.1759C50.5612 97.6631 51.3285 97.9254 52.1178 97.9254C52.9071 97.9254 53.6743 97.6631 54.3087 97.1759L61.01 92.0062L71.9204 83.5776L89.7866 66.6871L89.8324 66.6384C93.3238 63.176 95.7572 58.7818 96.8321 53.966C97.907 49.1503 97.5756 44.1211 95.876 39.4959V39.4759Z" />
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
  },
);

Card.displayName = "CodeStatsResult.Card";

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
      <p
        style={{
          fontFamily: "Space Mono, monospace",
        }}
        className="mt-2 text-4xl font-bold tracking-tighter"
      >
        {value}
      </p>
      {description && (
        <p className="text-muted-foreground mt-2 text-xs">{description}</p>
      )}
    </div>
  );
}
