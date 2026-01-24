import { useVaultStatus } from "@desktop/hooks/queries/use-vault-status";
import { useBackup } from "@desktop/hooks/use-backup";
import { useQueryKey } from "@desktop/hooks/use-query-key";
import { useVaultId } from "@desktop/hooks/use-vault-id";
import { vaultApi } from "@desktop/lib/vault";
import { useQuery } from "@tanstack/react-query";
import { tryCatch } from "@utils/try-catch";

export type CoreMountItem = {
  path: string;
  root: string;
};

export function useMount() {
  const { queryKeys, accountId } = useQueryKey();
  const { running } = useVaultStatus();
  const { vaultId } = useVaultId();
  const { data: backup } = useBackup();

  return useQuery({
    queryKey: queryKeys.directory.mount(backup?.rootID),
    queryFn: async () => {
      const [res, error] = await tryCatch(
        vaultApi(vaultId).get<CoreMountItem | { code: "NOT_FOUND" }>(
          `/api/v1/mounts/${backup?.rootID}`,
        ),
      );

      if (error && "code" in error && error.code == "NOT_FOUND") return null;
      if (error) throw error;

      return res.data as CoreMountItem;
    },
    enabled: !!accountId && !!vaultId && !!backup && running,
  });
}
