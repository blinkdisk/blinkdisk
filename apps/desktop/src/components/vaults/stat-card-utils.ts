export function getHistoryTrend(history?: number[]) {
  const first = history?.find((value) => value > 0) ?? history?.[0] ?? 0;
  const last = history?.[history.length - 1] ?? 0;
  const percent =
    first === 0 ? (last > 0 ? 100 : 0) : ((last - first) / first) * 100;

  return {
    direction: percent < 0 ? "down" : percent > 0 ? "up" : "flat",
    percent: Math.abs(percent),
  };
}
