import { useAppTranslation } from "@blinkdisk/hooks/use-app-translation";
import { Button } from "@blinkdisk/ui/button";
import { showErrorToast } from "@blinkdisk/utils/error-toast";
import { Empty } from "@desktop/components/empty";
import { useQueryKey } from "@desktop/hooks/use-query-key";
import { useVaultId } from "@desktop/hooks/use-vault-id";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { AlertTriangleIcon } from "lucide-react";

export function VaultFailed() {
  const { t } = useAppTranslation("vault.failed");
  const { vaultId } = useVaultId();
  const { queryKeys } = useQueryKey();
  const queryClient = useQueryClient();
  const { mutate, isPending } = useMutation({
    mutationFn: async () => {
      if (!vaultId) return;
      await window.electron.vault.retry(vaultId);
    },
    onError: showErrorToast,
    onSettled: () =>
      queryClient.invalidateQueries({
        queryKey: queryKeys.vault.status(vaultId),
      }),
  });

  return (
    <Empty
      title={t("error:VAULT_SERVER_UNAVAILABLE.title")}
      description={t("error:VAULT_SERVER_UNAVAILABLE.description")}
      icon={<AlertTriangleIcon />}
    >
      <Button onClick={() => mutate()} disabled={isPending} loading={isPending}>
        {t("retry")}
      </Button>
    </Empty>
  );
}
