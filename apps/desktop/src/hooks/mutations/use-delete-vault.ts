import { CustomError } from "@blinkdisk/utils/error";
import { showErrorToast } from "@blinkdisk/utils/error-toast";
import { useAccountId } from "@desktop/hooks/use-account-id";
import { useLogsnag } from "@desktop/hooks/use-logsnag";
import { useQueryKey } from "@desktop/hooks/use-query-key";
import { getVaultCollection } from "@desktop/lib/db";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { usePostHog } from "posthog-js/react";

export function useDeleteVault({ onSuccess }: { onSuccess?: () => void }) {
  const queryClient = useQueryClient();
  const posthog = usePostHog();

  const { queryKeys } = useQueryKey();
  const { logsnag } = useLogsnag();
  const { accountId } = useAccountId();

  return useMutation({
    mutationKey: ["vault", "delete"],
    mutationFn: async ({ vaultId }: { vaultId: string }) => {
      const vault = getVaultCollection(accountId).findOne({ id: vaultId });
      if (!vault) throw new CustomError("VAULT_NOT_FOUND");

      getVaultCollection(accountId).updateOne(
        {
          id: vaultId,
        },
        {
          $set: {
            status: "DELETED",
          },
        },
      );

      logsnag({
        icon: "🗑",
        title: "Vault deleted",
        description: `(${vault.provider}) ${vault.name} just got deleted.`,
        channel: "vaults",
      });

      posthog.capture("vault_delete", {
        provider: vault.provider,
        name: vault.name,
        vaultId,
      });
    },
    onError: showErrorToast,
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: queryKeys.vault.all,
        }),
        queryClient.invalidateQueries({
          queryKey: queryKeys.space,
        }),
      ]);

      onSuccess?.();
    },
  });
}
