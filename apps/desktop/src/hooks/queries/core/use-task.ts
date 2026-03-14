import { useQueryKey } from "@desktop/hooks/use-query-key";
import { useVaultId } from "@desktop/hooks/use-vault-id";
import { vaultApi } from "@desktop/lib/vault";
import { useQuery } from "@tanstack/react-query";

type CoreTaskStatus =
  | "RUNNING"
  | "CANCELING"
  | "CANCELED"
  | "SUCCESS"
  | "FAILED";

export type CoreTask = {
  id: string;
  startTime: string;
  endTime: string;
  kind: string;
  description: string;
  status: CoreTaskStatus;
  progressInfo: string;
  counters: Record<string, number> | null;
};

export function useTask(taskId?: string, enabled = true) {
  const { accountId, queryKeys } = useQueryKey();
  const { vaultId } = useVaultId();

  return useQuery({
    queryKey: queryKeys.task.single(taskId),
    queryFn: async () => {
      const res = await vaultApi(vaultId).get<CoreTask>(
        `/api/v1/tasks/${taskId}`,
      );
      return res.data;
    },
    refetchInterval: (query) => {
      const status = query.state.data?.status;
      if (status === "RUNNING" || status === "CANCELING") return 1000;
      return false;
    },
    enabled: enabled && !!accountId && !!vaultId && !!taskId,
  });
}
