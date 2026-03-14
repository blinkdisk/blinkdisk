import { CoreBackupIncompleteReason } from "#hooks/queries/core/use-backup-list";
import { useVaultStatus } from "#hooks/queries/use-vault-status";
import { useProfile } from "#hooks/use-profile";
import { useQueryKey } from "#hooks/use-query-key";
import { useVaultId } from "#hooks/use-vault-id";
import { hashFolder } from "#lib/folder";
import { vaultApi } from "#lib/vault";
import { useQuery } from "@tanstack/react-query";

export type FolderStatus = "IDLE" | "PENDING" | "UPLOADING" | "REMOTE";

export type CoreFolderItem = {
  id: string;
  name?: string;
  emoji?: string;
  source: {
    host: string;
    userName: string;
    path: string;
  };
  status: FolderStatus;
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
    rootEntry: {
      name: string;
      type: string;
      mode: string;
      mtime: string;
      uid: number;
      gid: number;
      obj: string;
      summ: {
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

export function useFolderList() {
  const { profileFilter } = useProfile();
  const { queryKeys, accountId } = useQueryKey();
  const { vaultId } = useVaultId();
  const { running } = useVaultStatus();

  return useQuery({
    queryKey: queryKeys.folder.list(vaultId, profileFilter),
    queryFn: async () => {
      if (!profileFilter) return null;

      const res = await vaultApi(vaultId).get<{
        sources: CoreFolderItem[];
        error?: string;
      }>("/api/v1/sources", {
        params: profileFilter,
      });

      const folders: CoreFolderItem[] = [];

      for (const folder of res.data.sources) {
        if (folder.status === "UPLOADING" && folder.upload) {
          folder.upload.progress = !folder.upload.estimatedBytes
            ? 0
            : (folder.upload.hashedBytes + folder.upload.cachedBytes) /
              folder.upload.estimatedBytes;
        }

        const id = await hashFolder({
          hostName: folder.source.host,
          userName: folder.source.userName,
          path: folder.source.path,
        });

        folders.push({
          ...folder,
          id,
        });
      }

      return folders;
    },
    refetchInterval: 1000,
    enabled: !!accountId && !!vaultId && !!profileFilter && running,
  });
}
