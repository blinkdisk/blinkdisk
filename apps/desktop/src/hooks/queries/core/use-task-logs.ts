import { useQueryKey } from "@desktop/hooks/use-query-key";
import { useVaultId } from "@desktop/hooks/use-vault-id";
import { vaultApi } from "@desktop/lib/vault";
import { useQuery } from "@tanstack/react-query";

export type CoreTaskLogEntry = {
  level: number;
  ts: number;
  mod: string;
  msg: string;
  [key: string]: unknown;
};

export function useTaskLogs(taskId?: string, enabled = true) {
  const { accountId } = useQueryKey();
  const { vaultId } = useVaultId();

  return useQuery({
    queryKey: [accountId, "task", vaultId, taskId, "logs"],
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
