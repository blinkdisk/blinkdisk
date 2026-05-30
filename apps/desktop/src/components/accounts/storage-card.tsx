import { useAppTranslation } from "@blinkdisk/hooks/use-app-translation";
import { Card, CardContent, CardTitle } from "@blinkdisk/ui/card";
import { CircularProgress } from "@blinkdisk/ui/circular-progress";
import { Skeleton } from "@blinkdisk/ui/skeleton";
import { cn } from "@blinkdisk/utils/class";
import { useSpace } from "@desktop/hooks/queries/use-space";
import { formatSize } from "@desktop/lib/number";
import { useMemo } from "react";

type StorageCardProps = {
  isLoading?: boolean;
};

export function StorageCard({ isLoading }: StorageCardProps) {
  const { t } = useAppTranslation("vault.overview");
  const { data: space } = useSpace();

  const storagePercentage = useMemo(() => {
    if (!space) return null;
    return Math.min(space.used / space.capacity, 1);
  }, [space]);

  const hasData = !isLoading && !!space;

  return (
    <Card
      className={cn(
        "flex shrink-0 items-center justify-center",
        (storagePercentage || 0) >= 0.9
          ? "border-destructive/20 bg-destructive/10 text-destructive [&_.muted]:text-destructive/70"
          : (storagePercentage || 0) >= 0.8
            ? "border-orange-600/20 bg-orange-600/10 text-orange-600 [&_.muted]:text-orange-600/70"
            : (storagePercentage || 0) >= 0.7
              ? "border-amber-600/20 bg-amber-600/10 text-amber-600 [&_.muted]:text-amber-600/70"
              : "",
      )}
    >
      <CardContent className="flex w-60 flex-col justify-between px-6 py-2">
        <div className="flex items-start justify-between">
          <div className="flex flex-col">
            <CardTitle className="text-sm font-medium">
              {hasData ? t("usedStorage.title") : <Skeleton width={100} />}
            </CardTitle>
            <p className="mt-1 text-3xl font-bold">
              {hasData ? (
                storagePercentage?.toLocaleString(undefined, {
                  style: "percent",
                }) || ""
              ) : (
                <Skeleton width={100} />
              )}
            </p>
          </div>
          {hasData ? (
            <CircularProgress
              value={100 * (storagePercentage || 0)}
              size={50}
              strokeWidth={6}
              progressClassName="opacity-60 dark:opacity-70"
            />
          ) : (
            <Skeleton width={50} height={50} />
          )}
        </div>
        <p className="muted text-muted-foreground mt-2 text-sm">
          {hasData ? (
            t("usedStorage.amount", {
              // Show 0B used if less than 20kb. Users were confused that
              // there was already space used after creating an empty vault.
              used: formatSize(space.used < 20000 ? 0 : space.used),
              capacity: formatSize(space.capacity),
            })
          ) : (
            <Skeleton width={160} />
          )}
        </p>
      </CardContent>
    </Card>
  );
}
