import { CustomError } from "@blinkdisk/utils/error";
import { useVaultStatus } from "@desktop/hooks/queries/use-vault-status";
import { useSourceId } from "@desktop/hooks/use-source-id";
import { useQueryKey } from "@desktop/hooks/use-query-key";
import { useQuery } from "@tanstack/react-query";

export function useRestoreList() {
  const { queryKeys } = useQueryKey();
  const { sourceId } = useSourceId();
  const { running } = useVaultStatus();

  return useQuery({
    queryKey: queryKeys.source.restores(sourceId),
    queryFn: async () => {
      if (!sourceId) throw new CustomError("MISSING_REQUIRED_VALUE");

      return await window.electron.vault.restore.list({
        sourceId,
      });
    },
    refetchInterval: 1000,
    enabled: !!sourceId && running,
  });
}
