import { getStorageProvider } from "@blinkdisk/constants/providers";
import { useAppTranslation } from "@blinkdisk/hooks/use-app-translation";
import type { ZVaultType } from "@blinkdisk/schemas/vault";
import { Card, CardContent } from "@blinkdisk/ui/card";
import { Skeleton } from "@blinkdisk/ui/skeleton";
import { useTheme } from "@desktop/hooks/use-theme";

type HealthCardProps = {
  isLoading?: boolean;
  vaults?: ZVaultType[];
};

function HealthGauge({ dark, score }: { dark: boolean; score: number }) {
  const centerX = 90;
  const centerY = 82;
  const needleLength = 48;
  const angle = Math.PI + (score / 100) * Math.PI;
  const needleX = centerX + Math.cos(angle) * needleLength;
  const needleY = centerY + Math.sin(angle) * needleLength;

  return (
    <svg
      aria-hidden="true"
      className="mx-[-2rem] mb-[-1rem] mt-[-1.25rem] w-48"
      viewBox="0 0 180 100"
    >
      <defs>
        <linearGradient
          id="health-gauge-gradient"
          x1="20"
          x2="160"
          y1="0"
          y2="0"
        >
          <stop offset="0%" stopColor="#ef4444" />
          <stop offset="100%" stopColor="#22c55e" />
        </linearGradient>
      </defs>
      <path
        d="M 25 82 A 65 65 0 0 1 155 82"
        fill="none"
        stroke="url(#health-gauge-gradient)"
        strokeLinecap="round"
        strokeWidth="14"
      />
      <line
        stroke={dark ? "#fff" : "#000"}
        strokeLinecap="round"
        strokeWidth="4"
        x1={centerX}
        x2={needleX}
        y1={centerY}
        y2={needleY}
      />
      <circle cx={centerX} cy={centerY} fill={dark ? "#fff" : "#000"} r="5" />
    </svg>
  );
}

export function HealthCard({ isLoading, vaults }: HealthCardProps) {
  const { t } = useAppTranslation("vault.overview");
  const { dark } = useTheme();
  const onlyLocalVaults =
    !!vaults?.length &&
    vaults.every((vault) => {
      const provider = getStorageProvider(vault.provider);

      return provider?.local;
    });
  const score = onlyLocalVaults ? 60 : 100;
  const scoreKey = onlyLocalVaults ? "localOnly" : "excellent";

  return (
    <Card className="grow">
      <CardContent className="flex h-full items-center gap-7 px-6 py-2">
        {!isLoading ? (
          <HealthGauge dark={dark} score={score} />
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
