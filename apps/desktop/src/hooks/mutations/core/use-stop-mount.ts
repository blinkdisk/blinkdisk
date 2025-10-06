import { useAccountId } from "@desktop/hooks/use-account-id";
import { useBackup } from "@desktop/hooks/use-backup";
import { useVaultId } from "@desktop/hooks/use-vault-id";
import { showErrorToast } from "@desktop/lib/error";
import { useAppTranslation } from "@hooks/use-app-translation";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

export function useStopMount() {
  const queryClient = useQueryClient();
  const { t } = useAppTranslation("directory.table.mount.stop.error");

  const { vaultId } = useVaultId();
  const { accountId } = useAccountId();
  const { data: backup } = useBackup();

  return useMutation({
    mutationKey: ["mount", "stop"],
    mutationFn: async () => {
      if (!vaultId || !backup) return;

      const res = (await window.electron.vault.fetch({
        vaultId,
        method: "DELETE",
        path: `/api/v1/mounts/${backup?.rootID}`,
      })) as { code?: "INTERNAL" };

      if (res.code === "INTERNAL")
        return toast.error(t("title"), {
          description: t("description"),
        });
    },
    onError: showErrorToast,
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: [accountId, "core", "mount", backup?.rootID],
      });
    },
  });
}
