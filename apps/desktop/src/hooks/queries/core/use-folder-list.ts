import { useVaultStatus } from "@desktop/hooks/queries/use-vault-status";
import { useAccountId } from "@desktop/hooks/use-account-id";
import { useDevice } from "@desktop/hooks/use-device";
import { useProfile } from "@desktop/hooks/use-profile";
import { useVaultId } from "@desktop/hooks/use-vault-id";
import { hashFolder } from "@desktop/lib/folder";
import { useQuery } from "@tanstack/react-query";

export type FolderStatus = "IDLE" | "PENDING" | "UPLOADING";

export type CoreFolderItem = {
  hash: string;
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
    incomplete?: "checkpoint";
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
};

export function useCoreFolderList() {
  const { profileId } = useProfile();
  const { deviceId } = useDevice();
  const { accountId } = useAccountId();
  const { vaultId } = useVaultId();
  const { running } = useVaultStatus();

  return useQuery({
    queryKey: [accountId, "core", "folder", "list", vaultId],
    queryFn: async () => {
      const data = await window.electron.vault.fetch({
        vaultId: vaultId!,
        method: "GET",
        path: "/api/v1/sources",
        search: {
          host: deviceId || "",
          userName: profileId || "",
        },
      });

      const folders: CoreFolderItem[] = [];

      for (const folder of data.sources) {
        if (folder.status === "UPLOADING" && folder.upload) {
          folder.upload.progress = !folder.upload.estimatedBytes
            ? 0
            : (folder.upload.hashedBytes + folder.upload.cachedBytes) /
              folder.upload.estimatedBytes;
        }

        folders.push({
          ...folder,
          hash: await hashFolder({
            deviceId: folder.source.host,
            profileId: folder.source.userName,
            path: folder.source.path,
          }),
        });
      }

      return folders;
    },
    refetchInterval: 1000,
    enabled: !!accountId && !!vaultId && running,
  });
}
