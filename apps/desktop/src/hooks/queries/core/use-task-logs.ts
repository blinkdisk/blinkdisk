import { useQueryKey } from "#hooks/use-query-key";
import { useVaultId } from "#hooks/use-vault-id";
import { vaultApi } from "#lib/vault";
import { useQuery } from "@tanstack/react-query";

export type CoreTaskLogEntry = {
  level: number;
  ts: number;
  mod: string;
  msg: string;
  [key: string]: unknown;
};

export function useTaskLogs(taskId?: string, enabled = true) {
  const { accountId, queryKeys } = useQueryKey();
  const { vaultId } = useVaultId();

  return useQuery({
    queryKey: queryKeys.task.logs(taskId),
    queryFn: async () => {
      const res = await vaultApi(vaultId).get<{ logs: CoreTaskLogEntry[] }>(
        `/api/v1/tasks/${taskId}/logs`,
      );
      return res.data.logs;
    },
    refetchInterval: 2000,
    enabled: enabled && !!accountId && !!vaultId && !!taskId,
  });
}
