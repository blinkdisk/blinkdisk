type HealthQuery = {
  data?: number | null;
  isPending: boolean;
  isError: boolean;
};

export function summarizeBackupHealth(queries: HealthQuery[]) {
  return {
    sourcesWithIssues: queries.reduce(
      (count, query) => count + (query.data ?? 0),
      0,
    ),
    isLoading: queries.some((query) => query.isPending),
    isUnavailable: queries.some(
      (query) => query.isError || query.data === null,
    ),
  };
}
