import { useFolder } from "@desktop/hooks/use-folder";
import { useQueryKey } from "@desktop/hooks/use-query-key";
import { useVaultId } from "@desktop/hooks/use-vault-id";
import { showErrorToast } from "@desktop/lib/error";
import { vaultApi } from "@desktop/lib/vault";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { CustomError } from "@utils/error";

export function useEditBackup({ onSuccess }: { onSuccess?: () => void }) {
  const queryClient = useQueryClient();

  const { data: folder } = useFolder();
  const { queryKeys } = useQueryKey();
  const { vaultId } = useVaultId();

  return useMutation({
    mutationKey: ["core", "backup", "edit"],
    mutationFn: async ({
      backupId,
      description,
      addPins,
      removePins,
    }: {
      backupId: string;
      description?: string;
      addPins?: string[];
      removePins?: string[];
    }) => {
      if (!vaultId) throw new CustomError("MISSING_REQUIRED_VALUE");

      await vaultApi(vaultId).post("/api/v1/snapshots/edit", {
        snapshots: [backupId],
        description,
        addPins,
        removePins,
      });
    },
    onError: showErrorToast,
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: queryKeys.backup.list(folder?.id),
      });

      onSuccess?.();
    },
  });
}
