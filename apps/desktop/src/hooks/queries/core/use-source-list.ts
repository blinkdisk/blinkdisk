import {
  type SourceType,
  sourceTypeFromKopiaEntryType,
  sourceTypeWithFallback,
} from "@blinkdisk/schemas/source";
import type { CoreBackupIncompleteReason } from "@desktop/hooks/queries/core/use-backup-list";
import { useVaultStatus } from "@desktop/hooks/queries/use-vault-status";
import { type SelectedProfile, useProfile } from "@desktop/hooks/use-profile";
import { useQueryKey } from "@desktop/hooks/use-query-key";
import { useVaultId } from "@desktop/hooks/use-vault-id";
import { isDraftPolicyUserName } from "@desktop/lib/policy-target";
import { kopiaParamsFromProfile } from "@desktop/lib/profile";
import { buildSourceId } from "@desktop/lib/source";
import { vaultApi } from "@desktop/lib/vault";
import { useQuery } from "@tanstack/react-query";

type SourceStatus = "IDLE" | "PENDING" | "UPLOADING" | "REMOTE";

export type CoreSourceItem = {
  id: string;
  name?: string;
  emoji?: string;
  type: SourceType;
  initialSourceType?: SourceType;
  source: {
    host: string;
    userName: string;
    path: string;
  };
  status: SourceStatus;
  schedule: {
    runMissed: boolean;
  };
  lastSnapshot?: {
    id: string;
    incomplete?: CoreBackupIncompleteReason;
    folder: {
      host: string;
      userName: string;
      path: string;
    };
    description: string;
    startTime: string;
    endTime: string;
    stats: {
      totalSize: number;
      excludedTotalSize: number;
      fileCount: number;
      cachedFiles: number;
      nonCachedFiles: number;
      dirCount: number;
      excludedFileCount: number;
      excludedDirCount: number;
      ignoredErrorCount: number;
      errorCount: number;
    };
    rootEntry?: {
      name: string;
      type?: string;
      mode: string;
      mtime: string;
      uid: number;
      gid: number;
      obj: string;
      summ?: {
        size: number;
        files: number;
        symlinks: number;
        dirs: number;
        maxTime: string;
        numFailed: number;
      };
    };
  };
  upload?: {
    cachedBytes: number;
    hashedBytes: number;
    uploadedBytes?: number;
    estimatedBytes?: number;
    cachedFiles: number;
    hashedFiles: number;
    excludedFiles?: number;
    excludedDirs?: number;
    errors?: number;
    ignoredErrors?: number;
    estimatedFiles?: number;
    directory: string;
    lastErrorPath?: string;
    lastError?: string;
    progress?: number;
  };
  currentTask: string;
  currentTaskStatus:
    | "RUNNING"
    | "CANCELING"
    | "CANCELED"
    | "SUCCESS"
    | "FAILED";
};

type UseSourceListOptions = {
  unfiltered?: boolean;
  includeDrafts?: boolean;
  profile?: SelectedProfile;
};

export function useSourceList(options: UseSourceListOptions = {}) {
  const { includeDrafts = false, unfiltered = false } = options;
  const { profile: routeSelectedProfile } = useProfile();
  const { queryKeys } = useQueryKey();
  const { vaultId } = useVaultId();
  const { running } = useVaultStatus();
  const profile =
    options.profile === undefined ? routeSelectedProfile : options.profile;
  const params =
    unfiltered || !profile ? undefined : kopiaParamsFromProfile(profile);

  return useQuery({
    queryKey: [
      ...(unfiltered
        ? [...queryKeys.source.all, "list", vaultId, "unfiltered"]
        : queryKeys.source.list(vaultId, profile)),
      includeDrafts ? "with-drafts" : "without-drafts",
    ],
    queryFn: async () => {
      if (!unfiltered && !profile) return null;

      const res = await vaultApi(vaultId).get<{
        sources: (Omit<CoreSourceItem, "id" | "type"> & {
          type?: SourceType;
        })[];
        error?: string;
      }>("/api/v1/sources", {
        params,
      });

      const sources: CoreSourceItem[] = [];

      for (const source of res.data.sources) {
        if (!includeDrafts && isDraftPolicyUserName(source.source.userName)) {
          continue;
        }

        if (source.status === "UPLOADING" && source.upload) {
          source.upload.progress = !source.upload.estimatedBytes
            ? 0
            : (source.upload.hashedBytes + source.upload.cachedBytes) /
              source.upload.estimatedBytes;
        }

        const id = buildSourceId({
          device: source.source.host,
          user: source.source.userName,
          path: source.source.path,
        });

        const type =
          source.type ||
          sourceTypeFromKopiaEntryType(source.lastSnapshot?.rootEntry?.type) ||
          sourceTypeWithFallback(source.initialSourceType);

        sources.push({
          ...source,
          id,
          type,
        });
      }

      return sources;
    },
    refetchInterval: 1000,
    enabled: !!vaultId && (unfiltered || !!profile) && running,
  });
}
