import { useVaultStatus } from "@desktop/hooks/queries/use-vault-status";
import { useDevice } from "@desktop/hooks/use-device";
import { useProfile } from "@desktop/hooks/use-profile";
import { useQueryKey } from "@desktop/hooks/use-query-key";
import { useVaultId } from "@desktop/hooks/use-vault-id";
import { hashFolder } from "@desktop/lib/folder";
import { trpc } from "@desktop/lib/trpc";
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
    hash: string;
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

export function useFolderList() {
  const { profileId, localProfileId } = useProfile();
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

      if (res.status !== 200) throw new Error(res.data.error);

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

      const canMigrate = profileId === localProfileId;
      const migrationRequired = folders.some((folder) => !folder.name);
      if (canMigrate && migrationRequired) {
        try {
          const oldFolders = await trpc.folder.list.query({
            vaultId: vaultId!,
          });

          for (const oldFolder of oldFolders) {
            const folderIndex = folders.findIndex(
              (folder) => folder.id === oldFolder.hash,
            );

            if (folderIndex === -1) continue;

            const folder = folders[folderIndex];
            if (!folder || folder.name) continue;

            if (folders[folderIndex]) {
              folders[folderIndex].name = oldFolder.name;
              folders[folderIndex].emoji = oldFolder.emoji;
            }

            const policy = await vaultApi(vaultId).get<{
              name: string;
              emoji: string;
              error?: string;
            }>("/api/v1/policy", {
              params: {
                userName: folder.source.userName,
                host: folder.source.host,
                path: folder.source.path,
              },
            });

            await vaultApi(vaultId).put<{
              error?: string;
            }>(
              "/api/v1/policy",
              {
                ...policy.data,
                name: oldFolder.name,
                emoji: oldFolder.emoji,
              },
              {
                params: {
                  userName: folder.source.userName,
                  host: folder.source.host,
                  path: folder.source.path,
                },
              },
            );
          }
        } catch (e) {
          console.warn("Failed to migrate folders", e);
        }
      }

      return folders;
    },
    refetchInterval: 1000,
    enabled: !!accountId && !!vaultId && running,
  });
}
