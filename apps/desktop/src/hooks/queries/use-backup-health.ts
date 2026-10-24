import type { ZVaultType } from "@blinkdisk/schemas/vault";
import type { CoreSourceItem } from "@desktop/hooks/queries/core/use-source-list";
import { useQueryKey } from "@desktop/hooks/use-query-key";
import { getBackupIssue } from "@desktop/lib/backup-issue";
import { isDraftPolicyUserName } from "@desktop/lib/policy-target";
import { vaultApi } from "@desktop/lib/vault";
import { useQueries } from "@tanstack/react-query";

export function useBackupHealth(vaults?: ZVaultType[]) {
  const { queryKeys } = useQueryKey();
  const queries = useQueries({
    queries: (vaults || []).map((vault) => ({
      queryKey: [...queryKeys.source.all, "health", vault.id],
      queryFn: async () => {
        const status = await window.electron.vault.status(vault.id);
        if (status?.status !== "RUNNING") return null;

        const res = await vaultApi(vault.id).get<{ sources: CoreSourceItem[] }>(
          "/api/v1/sources",
        );
        return res.data.sources.filter(
          (source) =>
            !isDraftPolicyUserName(source.source.userName) &&
            getBackupIssue(source),
        ).length;
      },
      refetchInterval: 2000,
    })),
  });

  return {
    failedSources: queries.reduce(
      (count, query) => count + (query.data || 0),
      0,
    ),
    isLoading: queries.some((query) => query.isPending),
  };
}
