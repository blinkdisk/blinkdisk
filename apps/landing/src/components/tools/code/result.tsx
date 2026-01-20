import { useIsMobile } from "@hooks/use-mobile";
import { GithubIcon } from "@landing/components/icons/github";
import { GitlabIcon } from "@landing/components/icons/gitlab";
import {
  CodeStatsFile,
  CodeStatsRepository,
} from "@landing/routes/(tools)/code";
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
import { forwardRef, useCallback, useMemo, useRef, useState } from "react";
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
        url: `${process.env.LANDING_URL}/code`,
        files: [file],
      });

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (e: any) {
      if (e.toString().includes("AbortError")) return;

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
              <GithubIcon className="size-5" />
            ) : (
              <GitlabIcon className="size-5" />
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
          <p>
            {new URL(process.env.LANDING_URL || "https://blinkdisk.com").host}
            /code
          </p>
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
