import { useVaultStatus } from "@desktop/hooks/queries/use-vault-status";
import { useAccountId } from "@desktop/hooks/use-account-id";
import { useDirectoryId } from "@desktop/hooks/use-directory-id";
import { useVaultId } from "@desktop/hooks/use-vault-id";
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
  const { accountId } = useAccountId();
  const { vaultId } = useVaultId();
  const { directoryId } = useDirectoryId();
  const { running } = useVaultStatus();

  return useQuery({
    queryKey: [accountId, "core", "directory", directoryId],
    queryFn: async () => {
      const data = (await window.electron.vault.fetch({
        vaultId: vaultId!,
        method: "GET",
        path: `/api/v1/objects/${directoryId}`,
      })) as { entries: CoreDirectoryItem[] };

      if (!data.entries) return [];

      return data.entries.map(
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
