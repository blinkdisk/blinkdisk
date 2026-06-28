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

const HEALTH_GAUGE_SEGMENTS = [
  { color: "#ef4444", endDegrees: 224, maxScore: 25, startDegrees: 190 },
  { color: "#f59e0b", endDegrees: 280, maxScore: 50, startDegrees: 240 },
  { color: "#b9e51d", endDegrees: 324, maxScore: 75, startDegrees: 296 },
  { color: "#22c55e", endDegrees: 348, maxScore: 100, startDegrees: 340 },
];

function getNeedleDegrees(score: number) {
  const clampedScore = Math.max(0, Math.min(100, score));
  let minScore = 0;

  for (const segment of HEALTH_GAUGE_SEGMENTS) {
    if (clampedScore <= segment.maxScore) {
      const scoreRange = segment.maxScore - minScore;
      const progress = scoreRange ? (clampedScore - minScore) / scoreRange : 0;

      return (
        segment.startDegrees +
        progress * (segment.endDegrees - segment.startDegrees)
      );
    }

    minScore = segment.maxScore;
  }

  return HEALTH_GAUGE_SEGMENTS.at(-1)?.endDegrees ?? 348;
}

function HealthGauge({ dark, score }: { dark: boolean; score: number }) {
  const centerX = 90;
  const centerY = 82;
  const radius = 52;
  const strokeWidth = 9;
  const needleLength = 45;
  const needleRadius = 5;
  const needleCenterY = centerY - needleRadius / 2;
  const angle = (getNeedleDegrees(score) * Math.PI) / 180;
  const needleTipX = centerX + Math.cos(angle) * needleLength;
  const needleTipY = needleCenterY + Math.sin(angle) * needleLength;
  const needleLeftX = centerX + Math.cos(angle + Math.PI / 2) * needleRadius;
  const needleLeftY =
    needleCenterY + Math.sin(angle + Math.PI / 2) * needleRadius;
  const needleRightX = centerX + Math.cos(angle - Math.PI / 2) * needleRadius;
  const needleRightY =
    needleCenterY + Math.sin(angle - Math.PI / 2) * needleRadius;
  const pointerColor = dark ? "#fff" : "#000";
  const needlePath = [
    `M ${needleLeftX} ${needleLeftY}`,
    `L ${needleTipX} ${needleTipY}`,
    `L ${needleRightX} ${needleRightY}`,
    "Z",
  ].join(" ");

  const getPoint = (degrees: number) => {
    const radians = (degrees * Math.PI) / 180;
    return {
      x: centerX + Math.cos(radians) * radius,
      y: centerY + Math.sin(radians) * radius,
    };
  };

  const arcPath = (startDegrees: number, endDegrees: number) => {
    const start = getPoint(startDegrees);
    const end = getPoint(endDegrees);

    return `M ${start.x} ${start.y} A ${radius} ${radius} 0 0 1 ${end.x} ${end.y}`;
  };

  const segments = HEALTH_GAUGE_SEGMENTS.map((segment) => ({
    color: segment.color,
    path: arcPath(segment.startDegrees, segment.endDegrees),
  }));

  return (
    <svg
      aria-hidden="true"
      className="mx-[-2rem] mb-[-1rem] mt-[-1.25rem] w-48"
      viewBox="0 0 180 100"
    >
      {segments.map((segment) => (
        <path
          d={segment.path}
          fill="none"
          key={segment.color}
          stroke={segment.color}
          strokeLinecap="round"
          strokeWidth={strokeWidth}
        />
      ))}
      <path d={needlePath} fill={pointerColor} />
      <circle
        cx={centerX}
        cy={needleCenterY}
        fill={pointerColor}
        r={needleRadius}
      />
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
  const score = onlyLocalVaults ? 40 : 100;
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
