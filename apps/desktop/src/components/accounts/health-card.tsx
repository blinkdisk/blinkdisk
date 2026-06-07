import { STORAGE_PROVIDERS } from "@blinkdisk/constants/providers";
import { useAppTranslation } from "@blinkdisk/hooks/use-app-translation";
import type { ZVaultType } from "@blinkdisk/schemas/vault";
import { Card, CardContent } from "@blinkdisk/ui/card";
import { Skeleton } from "@blinkdisk/ui/skeleton";
import { useTheme } from "@desktop/hooks/use-theme";
import { GaugeComponent } from "react-gauge-component";

type HealthCardProps = {
  isLoading?: boolean;
  vaults?: ZVaultType[];
};

export function HealthCard({ isLoading, vaults }: HealthCardProps) {
  const { t } = useAppTranslation("vault.overview");
  const { dark } = useTheme();
  const onlyLocalVaults =
    !!vaults?.length &&
    vaults.every((vault) => {
      const provider = STORAGE_PROVIDERS.find(
        (provider) => provider.type === vault.provider,
      );

      return provider?.local;
    });
  const score = onlyLocalVaults ? 60 : 100;
  const scoreKey = onlyLocalVaults ? "localOnly" : "excellent";

  return (
    <Card className="grow">
      <CardContent className="flex h-full items-center gap-7 px-6 py-2">
        {!isLoading ? (
          <GaugeComponent
            labels={{
              valueLabel: { hide: true },
              tickLabels: { hideMinMax: true },
            }}
            type="semicircle"
            arc={{
              colorArray: ["#ef4444", "#22c55e"],
              padding: 0.05,
              subArcs: [
                { limit: 30 },
                { limit: 60 },
                { limit: 85 },
                { limit: 100 },
                {},
              ],
            }}
            pointer={{
              type: "needle",
              animate: false,
              color: dark ? "#fff" : "#000",
            }}
            value={score}
            className="mx-[-2rem] mb-[-1rem] mt-[-1.25rem] w-48"
          />
        ) : (
          <Skeleton width="8rem" height="5rem" />
        )}
        <div className="flex flex-col gap-1">
          <p className="text-2xl font-bold">
            {!isLoading ? (
              t(`score.${scoreKey}.category`)
            ) : (
              <Skeleton width={100} />
            )}
          </p>
          <p className="text-muted-foreground text-sm">
            {!isLoading ? (
              t(`score.${scoreKey}.description`)
            ) : (
              <Skeleton width={200} count={2} />
            )}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
