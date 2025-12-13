import { CoreBackupIncompleteReason } from "@desktop/hooks/queries/core/use-backup-list";
import { useVaultStatus } from "@desktop/hooks/queries/use-vault-status";
import { useDevice } from "@desktop/hooks/use-device";
import { useProfile } from "@desktop/hooks/use-profile";
import { useQueryKey } from "@desktop/hooks/use-query-key";
import { useVaultId } from "@desktop/hooks/use-vault-id";
import { hashFolder } from "@desktop/lib/folder";
import { vaultApi } from "@desktop/lib/vault";
import { useQuery } from "@tanstack/react-query";

export type FolderStatus = "IDLE" | "PENDING" | "UPLOADING";

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
    uploadedBytes: number;
    estimatedBytes: number;
    cachedFiles: number;
    hashedFiles: number;
    excludedFiles: number;
    excludedDirs: number;
    errors: number;
    ignoredErrors: number;
    estimatedFiles: number;
    directory: string;
    lastErrorPath: string;
    lastError: string;
    progress: number;
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
  const { profileId } = useProfile();
  const { deviceId } = useDevice();
  const { queryKeys, accountId } = useQueryKey();
  const { vaultId } = useVaultId();
  const { running } = useVaultStatus();

  return useQuery({
    queryKey: queryKeys.folder.list(vaultId),
    queryFn: async () => {
      const res = await vaultApi(vaultId).get<{
        sources: CoreFolderItem[];
        error?: string;
      }>("/api/v1/sources", {
        params: {
          host: deviceId || "",
          userName: profileId || "",
        },
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
          deviceId: folder.source.host,
          profileId: folder.source.userName,
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
    enabled: !!accountId && !!vaultId && running,
  });
}
