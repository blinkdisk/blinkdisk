import { useBackup } from "@desktop/hooks/use-backup";
import { useQueryKey } from "@desktop/hooks/use-query-key";
import { useVaultId } from "@desktop/hooks/use-vault-id";
import { showErrorToast } from "@desktop/lib/error";
import { vaultApi } from "@desktop/lib/vault";
import { useAppTranslation } from "@hooks/use-app-translation";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

export function useStopMount() {
  const queryClient = useQueryClient();
  const { t } = useAppTranslation("directory.table.mount.stop.error");

  const { vaultId } = useVaultId();
  const { queryKeys } = useQueryKey();
  const { data: backup } = useBackup();

  return useMutation({
    mutationKey: ["mount", "stop"],
    mutationFn: async () => {
      if (!vaultId || !backup) return;

      const res = await vaultApi(vaultId).delete<{
        code?: "INTERNAL";
        error?: string;
      }>(`/api/v1/mounts/${backup?.rootID}`);

      if (res.data.code === "INTERNAL")
        return toast.error(t("title"), {
          description: t("description"),
        });

      if (res.data.error) throw new Error(res.data.error);
    },
    onError: showErrorToast,
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: queryKeys.directory.mount(backup?.rootID),
      });
    },
  });
}
