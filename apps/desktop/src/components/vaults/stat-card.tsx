import { Card, CardContent, CardTitle } from "@blinkdisk/ui/card";
import { Skeleton } from "@blinkdisk/ui/skeleton";
import { Sparkline } from "@blinkdisk/ui/sparkline";
import { ArrowDownRightIcon, ArrowUpRightIcon } from "lucide-react";

type VaultStatCardProps = {
  title: string;
  value?: string;
  history?: number[];
  isLoading: boolean;
};

export function VaultStatCard({
  title,
  value,
  history,
  isLoading,
}: VaultStatCardProps) {
  const trend = getHistoryTrend(history);
  const TrendIcon =
    trend.direction === "down" ? ArrowDownRightIcon : ArrowUpRightIcon;

  return (
    <Card className="overflow-hidden py-0">
      <CardContent className="flex h-full flex-col p-5">
        <div className="flex items-start justify-between gap-4">
          <CardTitle className="text-muted-foreground min-w-0 text-sm font-medium">
            {!isLoading ? title : <Skeleton width={90} />}
          </CardTitle>
          {!isLoading ? (
            <div className="text-foreground flex shrink-0 items-center gap-1 text-xs font-semibold">
              <TrendIcon className="size-4" />
              {formatTrendPercent(trend.percent)}
            </div>
          ) : null}
        </div>
        <div className="mt-auto flex items-end justify-between gap-4 pt-5">
          <p className="shrink-0 whitespace-nowrap text-4xl font-semibold tracking-normal">
            {!isLoading ? value : <Skeleton width={120} />}
          </p>
          {!isLoading ? (
            <Sparkline
              className="pointer-events-none h-10 min-w-0 max-w-48 flex-1 text-zinc-400 dark:text-zinc-500"
              values={history ?? []}
            />
          ) : null}
        </div>
      </CardContent>
    </Card>
  );
}

function getHistoryTrend(history?: number[]) {
  const first = history?.find((value) => value > 0) ?? history?.[0] ?? 0;
  const last = history?.[history.length - 1] ?? 0;
  const percent =
    first === 0 ? (last > 0 ? 100 : 0) : ((last - first) / first) * 100;

  return {
    direction: percent < 0 ? "down" : "up",
    percent: Math.abs(percent),
  };
}

function formatTrendPercent(percent: number) {
  return `${percent.toLocaleString(undefined, {
    maximumFractionDigits: 1,
    minimumFractionDigits: 1,
  })}%`;
}
