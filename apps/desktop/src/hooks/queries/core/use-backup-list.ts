import type { KopiaEntryType } from "@blinkdisk/schemas/source";
import { useVaultStatus } from "@desktop/hooks/queries/use-vault-status";
import { useSource } from "@desktop/hooks/use-source";
import { useProfile } from "@desktop/hooks/use-profile";
import { useQueryKey } from "@desktop/hooks/use-query-key";
import { useVaultId } from "@desktop/hooks/use-vault-id";
import { kopiaParamsFromProfile } from "@desktop/lib/profile";
import { vaultApi } from "@desktop/lib/vault";
import { useQuery } from "@tanstack/react-query";

export type CoreBackupIncompleteReason =
  | "checkpoint"
  | "canceled"
  | "limit reached";

export type CoreBackupItem = {
  id: string;
  description: string;
  startTime: string;
  endTime: string;
  incomplete?: CoreBackupIncompleteReason;
  summary: {
    size: number;
    files: number;
    symlinks: number;
    dirs: number;
    maxTime: string;
    numFailed: number;
  };
  rootID: string;
  rootEntryType: KopiaEntryType;
  retention: string[];
  pins: string[];
};

type UseBackupListOptions = {
  filters?: "source" | "none";
};

export function useBackupList({
  filters = "source",
}: UseBackupListOptions = {}) {
  const { profile } = useProfile();
  const { queryKeys } = useQueryKey();
  const { vaultId } = useVaultId();
  const { running } = useVaultStatus();
  const { data: source } = useSource();
  const useSourceFilters = filters === "source";

  return useQuery({
    queryKey: useSourceFilters
      ? queryKeys.backup.list(source?.id)
      : queryKeys.backup.unfiltered(vaultId),
    queryFn: async () => {
      const res = await vaultApi(vaultId).get<{
        snapshots: (Omit<CoreBackupItem, "rootEntryType"> & {
          rootEntryType?: KopiaEntryType | null;
        })[];
        unfilteredCount: number;
        uniqueCount: number;
        error?: string;
      }>("/api/v1/snapshots", {
        params: useSourceFilters
          ? {
              ...(profile ? kopiaParamsFromProfile(profile) : {}),
              path: source?.source.path || "",
              all: "1",
            }
          : undefined,
      });

      return res.data.snapshots
        .map((snapshot) => ({
          ...snapshot,
          rootEntryType: snapshot.rootEntryType || "d",
          summary: snapshot.summary || {
            size: 0,
            files: 0,
            symlinks: 0,
            dirs: 0,
            maxTime: snapshot.endTime,
            numFailed: 0,
          },
        }))
        .reverse();
    },
    refetchInterval: 1000,
    enabled: !!vaultId && (!useSourceFilters || !!source) && running,
  });
}
