import { useBackup } from "@desktop/hooks/use-backup";
import { useQueryKey } from "@desktop/hooks/use-query-key";
import { useVaultId } from "@desktop/hooks/use-vault-id";
import { showErrorToast } from "@desktop/lib/error";
import { vaultApi } from "@desktop/lib/vault";
import { useAppTranslation } from "@hooks/use-app-translation";
import { CustomError } from "@utils/error";
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
      if (!vaultId || !backup) throw new CustomError("MISSING_REQUIRED_VALUE");

      const res = await vaultApi(vaultId).delete<{
        code?: "INTERNAL";
      }>(`/api/v1/mounts/${backup?.rootID}`);

      if (res.data.code === "INTERNAL")
        return toast.error(t("title"), {
          description: t("description"),
        });
    },
    onError: showErrorToast,
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: queryKeys.directory.mount(backup?.rootID),
      });
    },
  });
}
