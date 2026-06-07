import { useId } from "react";

type SparklineProps = {
  className?: string;
  values: number[];
};

export function Sparkline({ className, values }: SparklineProps) {
  const gradientId = useId().replace(/:/g, "");
  const width = 130;
  const height = 52;
  const padding = 3;
  const max = Math.max(...values, 0);
  const min = Math.min(...values, 0);
  const range = max - min || 1;

  const points = values.map((value, index) => {
    const x =
      values.length <= 1
        ? width
        : (index / (values.length - 1)) * (width - padding * 2) + padding;
    const y =
      height - padding - ((value - min) / range) * (height - padding * 2);

    return { x, y };
  });

  if (points.length < 2) return null;

  const linePath = points.reduce((path, point, index) => {
    if (index === 0) return `M ${point.x} ${point.y}`;

    const previous = points[index - 1];
    if (!previous) return path;

    const controlX = (previous.x + point.x) / 2;

    return `${path} C ${controlX} ${previous.y}, ${controlX} ${point.y}, ${point.x} ${point.y}`;
  }, "");
  const firstPoint = points[0];
  const lastPoint = points[points.length - 1];
  if (!firstPoint || !lastPoint) return null;

  const areaPath = `${linePath} L ${lastPoint.x} ${height} L ${firstPoint.x} ${height} Z`;

  return (
    <svg
      aria-hidden="true"
      className={className}
      preserveAspectRatio="none"
      viewBox={`0 0 ${width} ${height}`}
    >
      <defs>
        <linearGradient id={gradientId} x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" stopColor="currentColor" stopOpacity="0.22" />
          <stop offset="100%" stopColor="currentColor" stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={areaPath} fill={`url(#${gradientId})`} />
      <path
        d={linePath}
        fill="none"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeOpacity="0.8"
        strokeWidth="2.25"
        vectorEffect="non-scaling-stroke"
      />
      <line
        opacity="0.75"
        stroke="currentColor"
        strokeLinecap="round"
        strokeWidth="6"
        vectorEffect="non-scaling-stroke"
        x1={lastPoint.x}
        x2={lastPoint.x}
        y1={lastPoint.y}
        y2={lastPoint.y}
      />
    </svg>
  );
}
