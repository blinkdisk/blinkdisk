import { useQueryKey } from "@desktop/hooks/use-query-key";
import { useVaultId } from "@desktop/hooks/use-vault-id";
import { convertPolicyToCore } from "@desktop/lib/policy";
import { vaultApi } from "@desktop/lib/vault";
import { ZPolicyType } from "@schemas/policy";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useRef, useState } from "react";

type TaskStatus = "RUNNING" | "SUCCESS" | "FAILURE";

type TaskCounter = {
  value: number;
  units?: string;
  level?: string;
};

type TaskCounters = {
  Bytes?: TaskCounter;
  Directories?: TaskCounter;
  Errors?: TaskCounter;
  "Excluded Bytes"?: TaskCounter;
  "Excluded Directories"?: TaskCounter;
  "Excluded Files"?: TaskCounter;
  Files?: TaskCounter;
  "Ignored Errors"?: TaskCounter;
};

export type TaskInfo = {
  id: string;
  startTime: string;
  endTime?: string;
  kind: string;
  description: string;
  status: TaskStatus;
  progressInfo: string;
  counters: TaskCounters | null;
};

export type EstimateResult = {
  included: {
    files: number;
    directories: number;
    bytes: number;
  };
  excluded: {
    files: number;
    directories: number;
    bytes: number;
  };
};

export function useFolderSize({
  path,
  policy,
  enabled = true,
}: {
  path: string;
  policy?: ZPolicyType | null;
  enabled?: boolean;
}) {
  const { vaultId } = useVaultId();
  const { queryKeys, accountId } = useQueryKey();
  const queryClient = useQueryClient();

  const [taskId, setTaskId] = useState<string | null>(null);

  const prevPathRef = useRef<string>(path);
  const prevPolicyFilesRef = useRef(policy?.files);

  const startEstimation = useMutation({
    mutationKey: ["folder", "size-estimate", "start"],
    mutationFn: async () => {
      if (!vaultId || !path) throw new Error("Missing vaultId or path");

      const res = await vaultApi(vaultId).post<TaskInfo>("/api/v1/estimate", {
        root: path,
        maxExamplesPerBucket: 10,
        policyOverride: policy ? convertPolicyToCore(policy) : {},
      });

      if (!res.data) throw new Error("Failed to start estimation");

      setTaskId(res.data.id);
      return res.data;
    },
    onError: () => {
      setTaskId(null);
    },
  });

  const taskQuery = useQuery({
    queryKey: queryKeys.folder.size(vaultId, taskId),
    queryFn: async () => {
      if (!vaultId || !taskId) return null;

      const res = await vaultApi(vaultId).get<TaskInfo>(
        `/api/v1/tasks/${taskId}`,
      );

      return res.data;
    },
    enabled:
      enabled &&
      !!accountId &&
      !!vaultId &&
      !!taskId &&
      startEstimation.isSuccess,
    refetchInterval: (query) => {
      const data = query.state.data;
      if (data?.status === "RUNNING") return 1000;
      return false;
    },
  });

  useEffect(() => {
    const pathChanged = prevPathRef.current !== path;
    const policyFilesChanged =
      JSON.stringify(prevPolicyFilesRef.current) !==
      JSON.stringify(policy?.files);

    if (pathChanged || policyFilesChanged) {
      setTaskId(null);

      if (vaultId)
        queryClient.invalidateQueries({
          queryKey: queryKeys.folder.size(vaultId),
        });

      prevPathRef.current = path;
      prevPolicyFilesRef.current = policy?.files;
    }
  }, [path, policy?.files, vaultId, queryClient, queryKeys.folder]);

  const result: EstimateResult | null = taskQuery.data?.counters
    ? {
        included: {
          files: taskQuery.data.counters.Files?.value || 0,
          directories: taskQuery.data.counters.Directories?.value || 0,
          bytes: taskQuery.data.counters.Bytes?.value || 0,
        },
        excluded: {
          files: taskQuery.data.counters["Excluded Files"]?.value || 0,
          directories:
            taskQuery.data.counters["Excluded Directories"]?.value || 0,
          bytes: taskQuery.data.counters["Excluded Bytes"]?.value || 0,
        },
      }
    : null;

  return {
    startEstimation: () => startEstimation.mutate(),
    isLoading: startEstimation.isPending || taskQuery.isFetching,
    isRunning: taskQuery.data?.status === "RUNNING",
    isSuccess: taskQuery.data?.status === "SUCCESS",
    isError: startEstimation.isError || taskQuery.isError,
    error: startEstimation.error || taskQuery.error,
    result,
  };
}
