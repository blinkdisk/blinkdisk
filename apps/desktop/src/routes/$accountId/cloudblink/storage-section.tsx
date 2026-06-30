import {
  STORAGE_USAGE_CRITICAL_THRESHOLD,
  STORAGE_USAGE_WARNING_THRESHOLD,
} from "@blinkdisk/constants/space";
import { useAppTranslation } from "@blinkdisk/hooks/use-app-translation";
import { Alert, AlertDescription, AlertTitle } from "@blinkdisk/ui/alert";
import { Skeleton } from "@blinkdisk/ui/skeleton";
import { cn } from "@blinkdisk/utils/class";
import {
  SettingsGroup,
  SettingsPanel,
  SettingsRow,
} from "@desktop/components/settings";
import { useSpace } from "@desktop/hooks/queries/use-space";
import { formatSize } from "@desktop/lib/number";
import { CircleAlertIcon } from "lucide-react";

const STORAGE_SEGMENT_COUNT = 28;
const STORAGE_SEGMENTS = Array.from(
  { length: STORAGE_SEGMENT_COUNT },
  (_, index) => index,
);

export function StorageSection() {
  const { t } = useAppTranslation("cloudblink.page.storage");
  const { data: space, isLoading } = useSpace();

  const storagePercentage = (() => {
    if (!space) return null;
    if (space.capacity === 0) return 1;
    return Math.min(space.used / space.capacity, 1);
  })();

  const hasData = !isLoading && !!space;
  const storageRatio = storagePercentage || 0;
  const storagePercent = Math.round(storageRatio * 100);
  const filledSegments = Math.round(storageRatio * STORAGE_SEGMENT_COUNT);
  const filledSegmentClassName =
    storageRatio >= STORAGE_USAGE_CRITICAL_THRESHOLD
      ? "bg-destructive"
      : storageRatio >= STORAGE_USAGE_WARNING_THRESHOLD
        ? "bg-amber-600 dark:bg-amber-500"
        : "bg-primary";

  if (!isLoading && !space) return null;

  return (
    <SettingsGroup title={t("title")}>
      <SettingsPanel>
        <SettingsRow fullWidth>
          {hasData ? (
            <div className="grid gap-5 py-1">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
                <p className="flex items-baseline gap-1">
                  <span className="text-[2.75rem] font-bold tabular-nums leading-none tracking-normal">
                    {storagePercent.toLocaleString()}
                  </span>
                  <span className="text-xl font-bold">%</span>
                  <span className="text-muted-foreground ml-1 text-sm font-medium">
                    {t("usedSuffix")}
                  </span>
                </p>
                <div className="tabular-nums sm:text-right">
                  <p className="text-foreground text-base font-semibold">
                    {
                      // Show 0B used if less than 20kb. Users were confused that
                      // there was already space used after creating an empty vault.
                      formatSize(space.used < 20000 ? 0 : space.used)
                    }
                  </p>
                  <p className="text-muted-foreground text-sm font-medium">
                    {t("ofCapacity", {
                      capacity: formatSize(space.capacity),
                    })}
                  </p>
                </div>
              </div>
              <div className="flex h-9 w-full gap-1 overflow-hidden">
                {STORAGE_SEGMENTS.map((segment) => (
                  <div
                    key={segment}
                    className={cn(
                      "h-full flex-1 rounded-[3px]",
                      segment < filledSegments
                        ? filledSegmentClassName
                        : "bg-gray-200 dark:bg-white/5",
                    )}
                  />
                ))}
              </div>
            </div>
          ) : (
            <div className="flex flex-col gap-3 py-1">
              <div className="flex items-center justify-between gap-4">
                <Skeleton width={160} />
                <Skeleton width={40} />
              </div>
              <Skeleton height={8} />
            </div>
          )}
        </SettingsRow>
        {hasData && space.capacity === 0 ? (
          <SettingsRow fullWidth>
            <Alert variant="destructive">
              <CircleAlertIcon />
              <AlertTitle>{t("full.title")}</AlertTitle>
              <AlertDescription>{t("full.description")}</AlertDescription>
            </Alert>
          </SettingsRow>
        ) : null}
      </SettingsPanel>
    </SettingsGroup>
  );
}
