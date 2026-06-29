import { SourceCard } from "@blinkdisk/components/source-card";
import { Skeleton } from "@blinkdisk/ui/skeleton";
import { cn } from "@blinkdisk/utils/class";
import type { CoreSourceItem } from "@desktop/hooks/queries/core/use-source-list";
import { useTheme } from "@desktop/hooks/use-theme";
import { MonitorIcon, UserIcon } from "lucide-react";

type SourcePreviewProps = {
  source?: CoreSourceItem;
  size?: "sm" | "default";
};

export function SourcePreview({ source, size }: SourcePreviewProps) {
  const { dark } = useTheme();

  return (
    <div
      className={cn(
        "flex w-full min-w-0 items-center gap-4",
        size === "sm" && "gap-3",
      )}
    >
      {source ? (
        <SourceCard
          emoji={source.emoji}
          type={source.type}
          size={size === "sm" ? 2.25 : 2.8}
          theme={dark ? "dark" : "light"}
        />
      ) : (
        <Skeleton
          width={size === "sm" ? "2.25rem" : "2.75rem"}
          height={size === "sm" ? "2.25rem" : "2.75rem"}
          className="rounded-md"
        />
      )}
      <div className="flex w-full flex-col">
        <div className="flex items-center gap-1.5">
          <h2
            className={cn(
              "ph-no-capture max-w-full truncate text-lg font-semibold",
              size === "sm" && "text-sm",
            )}
          >
            {source ? (
              source.name || source.source.path
            ) : (
              <Skeleton width={100} />
            )}
          </h2>
        </div>
        {source ? (
          <SourceProfile source={source} size={size} />
        ) : (
          <Skeleton width={120} />
        )}
      </div>
    </div>
  );
}

function SourceProfile({
  source,
  size,
}: {
  source: CoreSourceItem;
  size?: "sm" | "default";
}) {
  return (
    <div
      className={cn(
        "text-muted-foreground ph-no-capture flex min-w-0 max-w-full items-center gap-3 text-sm font-normal",
        size === "sm" && "text-xs",
      )}
    >
      <span className="flex min-w-0 max-w-48 items-center gap-1.5">
        <MonitorIcon className="size-3.5 shrink-0" />
        <span className="truncate">{source.source.host}</span>
      </span>
      <span className="flex min-w-0 max-w-48 items-center gap-1.5">
        <UserIcon className="size-3.5 shrink-0" />
        <span className="truncate">{source.source.userName}</span>
      </span>
    </div>
  );
}
