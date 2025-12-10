import { useVaultStatus } from "@desktop/hooks/queries/use-vault-status";
import { useDirectoryId } from "@desktop/hooks/use-directory-id";
import { useQueryKey } from "@desktop/hooks/use-query-key";
import { useVaultId } from "@desktop/hooks/use-vault-id";
import { vaultApi } from "@desktop/lib/vault";
import { useQuery } from "@tanstack/react-query";

export type CoreDirectoryItem = {
  name: string;
  type: "d" | "f" | "s";
  mode: string;
  mtime: string;
  uid: number;
  gid: number;
  obj: string;
  size?: number;
  summ?: {
    size: number;
    files: number;
    symlinks: number;
    dirs: number;
    maxTime: string;
    numFailed: number;
  };
};

export type DirectoryItem = {
  id: string;
  objectId: string;
  name: string;
  type: "FILE" | "DIRECTORY" | "SYMLINK";
  size?: number;
  meta: {
    mode: string;
    uid: number;
    gid: number;
  };
  stats: {
    size: number;
    files?: number;
    symlinks?: number;
    directories?: number;
    failed?: number;
    maxTime?: string | null;
  };
  modifiedAt: string;
};

export function useDirectory() {
  const { queryKeys, accountId } = useQueryKey();
  const { vaultId } = useVaultId();
  const { directoryId } = useDirectoryId();
  const { running } = useVaultStatus();

  return useQuery({
    queryKey: queryKeys.directory.detail(directoryId),
    queryFn: async () => {
      const res = await vaultApi(vaultId).get<{
        stream: string;
        summary: {
          size: number;
          files: number;
          symlinks: number;
          dirs: number;
          maxTime: string;
          numFailed: number;
        };
        entries: CoreDirectoryItem[];
        error?: string;
      }>(`/api/v1/objects/${directoryId}`);

      if (!res.data.entries) return [];

      return res.data.entries.map(
        (entry) =>
          ({
            id: `${entry.obj}:${entry.name}`,
            objectId: entry.obj,
            name: entry.name,
            type:
              entry.type === "d"
                ? "DIRECTORY"
                : entry.type === "s"
                  ? "SYMLINK"
                  : "FILE",
            meta: {
              mode: entry.mode,
              uid: entry.uid,
              gid: entry.gid,
            },
            stats: {
              size: entry.size || entry.summ?.size || 0,
              ...(entry.summ
                ? {
                    files: entry.summ?.files || 0,
                    symlinks: entry.summ?.symlinks || 0,
                    directories: entry.summ?.dirs || 0,
                    failed: entry.summ?.numFailed || 0,
                    maxTime: entry.summ?.maxTime || null,
                  }
                : {}),
            },
            modifiedAt: entry.mtime,
          }) satisfies DirectoryItem,
      );
    },
    enabled: !!accountId && !!vaultId && !!directoryId && running,
  });
}
