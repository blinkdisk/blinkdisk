import type {
  NormalizedBackupTool,
  NormalizedCellValue,
} from "@blinkdisk/constants/comparison";
import { Badge } from "@blinkdisk/ui/badge";
import { Button } from "@blinkdisk/ui/button";
import { cn } from "@blinkdisk/utils/class";
import { ExternalLinkIcon, ScaleIcon, XIcon } from "lucide-react";
import type { ComponentProps, ReactElement, SVGProps } from "react";

export type SelectedKey = {
  category:
    | "general"
    | "level"
    | "strategies"
    | "features"
    | "interface"
    | "privacy"
    | "platforms"
    | "storages";
  key: string;
};

type FinderResultCardProps = {
  tool: NormalizedBackupTool;
};

const pricingLabel: Record<NormalizedBackupTool["pricing"], string> = {
  free: "Free",
  freemium: "Freemium",
  paid: "Paid",
};

const pricingClass: Record<NormalizedBackupTool["pricing"], string> = {
  free: "border-green-500/20 bg-green-500/10 text-green-700 dark:text-green-400",
  freemium:
    "border-blue-500/20 bg-blue-500/10 text-blue-700 dark:text-blue-400",
  paid: "border-orange-500/20 bg-orange-500/10 text-orange-700 dark:text-orange-400",
};

// Inline platform SVGs so we can tint them with currentColor in React
function WindowsIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden {...props}>
      <path d="M0 12v-8.646l10-1.355v10.001h-10zm11 0h13v-12l-13 1.807v10.193zm-1 1h-10v7.646l10 1.355v-9.001zm1 0v9.194l13 1.806v-11h-13z" />
    </svg>
  );
}
function AppleIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden {...props}>
      <path d="M22 17.607c-.786 2.28-3.139 6.317-5.563 6.361-1.608.031-2.125-.953-3.963-.953-1.837 0-2.412.923-3.932.983-2.572.099-6.542-5.827-6.542-10.995 0-4.747 3.308-7.1 6.198-7.143 1.55-.028 3.014 1.045 3.959 1.045.949 0 2.727-1.29 4.596-1.101.782.033 2.979.315 4.389 2.377-3.741 2.442-3.158 7.549.858 9.426zm-5.222-17.607c-2.826.114-5.132 3.079-4.81 5.531 2.612.203 5.118-2.725 4.81-5.531z" />
    </svg>
  );
}
function LinuxIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 16 16" fill="currentColor" aria-hidden {...props}>
      <path d="M13.281 11.156a.84.84 0 0 1 .375.297c.084.125.143.276.18.453.02.104.044.2.07.29a1.772 1.772 0 0 0 .219.476c.047.073.11.153.188.242.067.073.127.167.18.281a.793.793 0 0 1 .077.328.49.49 0 0 1-.093.305.944.944 0 0 1-.235.219c-.12.083-.245.156-.375.219-.13.062-.26.127-.39.195a3.624 3.624 0 0 0-.555.328c-.156.115-.313.26-.469.438a2.815 2.815 0 0 1-.625.523 1.471 1.471 0 0 1-.383.172c-.13.036-.26.06-.39.07-.302 0-.552-.052-.75-.156-.198-.104-.37-.294-.516-.57-.042-.079-.083-.128-.125-.149a.774.774 0 0 0-.203-.055L8.67 15c-.26-.02-.525-.031-.796-.031a4.28 4.28 0 0 0-.672.054c-.229.037-.456.081-.68.133-.046.01-.093.05-.14.117a1.7 1.7 0 0 1-.196.227 1.106 1.106 0 0 1-.335.219 1.475 1.475 0 0 1-.555.101c-.172 0-.357-.018-.555-.054a1.82 1.82 0 0 1-.531-.18 3.578 3.578 0 0 0-.953-.328c-.313-.057-.643-.11-.992-.156a3.392 3.392 0 0 1-.344-.063.774.774 0 0 1-.29-.133.705.705 0 0 1-.194-.219.78.78 0 0 1-.079-.351c0-.162.021-.318.063-.469.042-.15.065-.31.07-.476 0-.115-.008-.227-.023-.336a3.53 3.53 0 0 1-.032-.352c0-.265.063-.46.188-.586.125-.125.307-.224.547-.297a.99.99 0 0 0 .297-.148 2.27 2.27 0 0 0 .234-.203 1.86 1.86 0 0 0 .203-.242c.063-.089.133-.178.211-.266a.114.114 0 0 0 .024-.07c0-.063-.003-.123-.008-.18l-.016-.188c0-.354.055-.71.164-1.07.11-.36.253-.71.43-1.055a9.08 9.08 0 0 1 .594-.992c.218-.317.435-.612.648-.883a4.35 4.35 0 0 0 .68-1.203c.15-.416.229-.87.234-1.36 0-.207-.01-.413-.031-.616a6.122 6.122 0 0 1-.031-.625c0-.417.047-.792.14-1.125.094-.334.24-.62.438-.86s.456-.419.773-.539C7.474.075 7.854.01 8.296 0c.527 0 .946.104 1.259.313.312.208.552.481.718.82.167.338.274.716.32 1.133.048.416.074.838.079 1.265v.133c0 .214.002.404.008.57a2.527 2.527 0 0 0 .226.977c.073.161.182.336.328.523.25.329.506.66.766.993.26.333.497.677.71 1.03.214.355.389.725.524 1.11.136.386.206.802.211 1.25a3.3 3.3 0 0 1-.164 1.04z" />
    </svg>
  );
}
function AndroidIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden {...props}>
      <path d="M17.523 15.341a.96.96 0 100-1.92.96.96 0 000 1.92zm-11.046 0a.96.96 0 100-1.92.96.96 0 000 1.92zm11.405-6.02l1.997-3.46a.416.416 0 00-.152-.566.416.416 0 00-.566.152l-2.022 3.502a12.247 12.247 0 00-5.139-1.108c-1.846 0-3.583.39-5.139 1.108L4.84 5.447a.416.416 0 00-.566-.152.416.416 0 00-.152.566l1.997 3.46C2.688 11.196.343 14.936.343 19.201h23.314c0-4.265-2.345-8.005-5.775-9.88z" />
    </svg>
  );
}

type PlatformEntry = {
  key: keyof NormalizedBackupTool["platforms"];
  label: string;
  Icon: (props: SVGProps<SVGSVGElement>) => ReactElement;
};

const PLATFORMS: PlatformEntry[] = [
  { key: "windows", label: "Windows", Icon: WindowsIcon },
  { key: "macos", label: "macOS", Icon: AppleIcon },
  { key: "linux", label: "Linux", Icon: LinuxIcon },
  { key: "android", label: "Android", Icon: AndroidIcon },
  { key: "ios", label: "iOS", Icon: AppleIcon },
];

type SupportState = "full" | "partial" | "none" | "unknown";

function supportState(cell: NormalizedCellValue): SupportState {
  if (cell.value === null) return "unknown";
  if (cell.value === true) return "full";
  if (cell.value === "partial") return "partial";
  if (cell.value === false) return "none";
  return "unknown";
}

export function FinderResultCard({ tool }: FinderResultCardProps) {
  const compareHref = `/compare/${tool.slug}`;

  const releaseYear =
    typeof tool.general.releaseYear.value === "string"
      ? tool.general.releaseYear.value
      : null;
  const originCountry =
    typeof tool.general.originCountry.value === "string"
      ? tool.general.originCountry.value
      : null;

  const folderBackups = supportState(tool.level.folderBackups);
  const imageBackups = supportState(tool.level.imageBackups);
  const backupKinds: string[] = [];
  if (folderBackups === "full" || folderBackups === "partial") {
    backupKinds.push(folderBackups === "partial" ? "Files (partial)" : "Files");
  }
  if (imageBackups === "full" || imageBackups === "partial") {
    backupKinds.push(
      imageBackups === "partial" ? "Disk image (partial)" : "Disk image",
    );
  }

  return (
    <div className="bg-card flex flex-col gap-4 overflow-hidden rounded-lg border p-4 transition-colors sm:flex-row sm:items-stretch sm:gap-5 sm:p-5">
      <a
        href={compareHref}
        className="bg-muted group relative block aspect-[10/7] w-full shrink-0 overflow-hidden rounded-md sm:aspect-auto sm:h-auto sm:w-44 md:w-56"
        aria-label={`Compare ${tool.name}`}
        data-astro-prefetch
      >
        <img
          src={`https://static.blinkdisk.com/compare/screenshots/${tool.slug}.jpg`}
          alt={`${tool.name} screenshot`}
          loading="lazy"
          className="h-full w-full object-cover object-top transition-transform duration-300 group-hover:scale-[1.02]"
        />
      </a>

      <div className="flex min-w-0 flex-1 flex-col gap-3">
        <div className="flex flex-col gap-1">
          <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
            <h3 className="text-foreground text-lg font-semibold leading-tight">
              {tool.name}
            </h3>
            <Badge className={cn("ml-auto", pricingClass[tool.pricing])}>
              {pricingLabel[tool.pricing]}
            </Badge>
          </div>
          {(releaseYear || originCountry) && (
            <div className="text-muted-foreground flex flex-wrap items-center gap-x-2 gap-y-0.5 text-xs">
              {releaseYear && <span>Released {releaseYear}</span>}
              {releaseYear && originCountry && (
                <span className="text-border">·</span>
              )}
              {originCountry && <span>{originCountry}</span>}
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 gap-x-6 gap-y-3 sm:grid-cols-[auto_1fr]">
          <InfoLabel>Platforms</InfoLabel>
          <div className="flex flex-wrap items-center gap-1.5">
            {PLATFORMS.map(({ key, label, Icon }) => {
              const state = supportState(tool.platforms[key]);
              return (
                <PlatformPill
                  key={key}
                  label={label}
                  state={state}
                  Icon={Icon}
                />
              );
            })}
          </div>

          {backupKinds.length > 0 && (
            <>
              <InfoLabel>Backs up</InfoLabel>
              <div className="text-foreground text-sm">
                {backupKinds.join(", ")}
              </div>
            </>
          )}
        </div>

        <div className="mt-auto flex flex-col gap-2 pt-1 sm:flex-row sm:items-center">
          <Button
            render={
              <a
                href={tool.website}
                target="_blank"
                rel="noopener noreferrer"
              />
            }
            variant="secondary"
            size="sm"
            className="flex-1"
          >
            <ExternalLinkIcon className="size-4" />
            Website
          </Button>
          <Button
            render={<a href={compareHref} data-astro-prefetch />}
            size="sm"
            className="flex-1"
          >
            <ScaleIcon className="size-4" />
            Compare
          </Button>
        </div>
      </div>
    </div>
  );
}

function InfoLabel({ children }: ComponentProps<"span">) {
  return (
    <span className="text-muted-foreground pt-1 text-xs font-medium uppercase tracking-wide sm:self-start">
      {children}
    </span>
  );
}

type PlatformPillProps = {
  label: string;
  state: SupportState;
  Icon: (props: SVGProps<SVGSVGElement>) => ReactElement;
};

function PlatformPill({ label, state, Icon }: PlatformPillProps) {
  const title =
    state === "full"
      ? label
      : state === "partial"
        ? `${label} (partial)`
        : state === "none"
          ? `${label} (not supported)`
          : `${label} (no data)`;

  return (
    <span
      title={title}
      className={cn(
        "relative inline-flex size-7 items-center justify-center rounded-md border transition-colors",
        state === "full" &&
          "border-green-500/20 bg-green-500/10 text-green-700 dark:text-green-400",
        state === "partial" &&
          "border-yellow-500/20 bg-yellow-500/10 text-yellow-700 dark:text-yellow-400",
        state === "none" &&
          "border-border bg-muted/40 text-muted-foreground/40",
        state === "unknown" &&
          "border-border text-muted-foreground/40 border-dashed bg-transparent",
      )}
    >
      <Icon className="size-3.5" />
      <span className="sr-only">{title}</span>
      {state === "none" && (
        <XIcon className="bg-card text-muted-foreground/70 absolute -bottom-0.5 -right-0.5 size-3 rounded-full p-0.5" />
      )}
    </span>
  );
}
