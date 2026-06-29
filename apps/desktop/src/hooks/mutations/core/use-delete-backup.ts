import { CustomError } from "@blinkdisk/utils/error";
import { showErrorToast } from "@blinkdisk/utils/error-toast";
import { useProfile } from "@desktop/hooks/use-profile";
import { useQueryKey } from "@desktop/hooks/use-query-key";
import { useSource } from "@desktop/hooks/use-source";
import { useVaultId } from "@desktop/hooks/use-vault-id";
import { kopiaParamsFromProfile } from "@desktop/lib/profile";
import { vaultApi } from "@desktop/lib/vault";
import { useMutation, useQueryClient } from "@tanstack/react-query";

export function useDeleteBackup({ onSuccess }: { onSuccess?: () => void }) {
  const queryClient = useQueryClient();

  const { data: source } = useSource();
  const { profile } = useProfile();
  const { queryKeys } = useQueryKey();
  const { vaultId } = useVaultId();

  return useMutation({
    mutationKey: ["core", "backup", "delete"],
    mutationFn: async ({ backupId }: { backupId: string }) => {
      if (!vaultId || !profile) throw new CustomError("MISSING_REQUIRED_VALUE");

      await vaultApi(vaultId).post("/api/v1/snapshots/delete", {
        source: {
          ...kopiaParamsFromProfile(profile),
          path: source?.source.path || "",
        },
        snapshotManifestIds: [backupId],
        deleteSourceAndPolicy: false,
      });
    },
    onError: showErrorToast,
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: queryKeys.backup.list(source?.id),
      });

      onSuccess?.();
    },
  });
}
