import { useQueryKey } from "@desktop/hooks/use-query-key";
import { useVaultId } from "@desktop/hooks/use-vault-id";
import { showErrorToast } from "@desktop/lib/error";
import { convertThrottleToCore } from "@desktop/lib/throttle";
import { vaultApi } from "@desktop/lib/vault";
import { ZVaultThrottleType } from "@schemas/vault";
import { useMutation, useQueryClient } from "@tanstack/react-query";

export function useUpdateThrottle(onSuccess?: () => void) {
  const queryClient = useQueryClient();

  const { queryKeys } = useQueryKey();
  const { vaultId } = useVaultId();

  return useMutation({
    mutationKey: ["core", "vault", vaultId, "policy"],
    mutationFn: async (values: ZVaultThrottleType) => {
      await vaultApi(vaultId).put(
        "/api/v1/repo/throttle",
        convertThrottleToCore(values),
      );
    },
    onError: showErrorToast,
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: queryKeys.vault.throttle(vaultId),
      });

      onSuccess?.();
    },
  });
}
