import { useDevice } from "@desktop/hooks/use-device";
import { useProfile } from "@desktop/hooks/use-profile";
import { useQueryKey } from "@desktop/hooks/use-query-key";
import { useVaultId } from "@desktop/hooks/use-vault-id";
import { showErrorToast } from "@desktop/lib/error";
import { convertPolicyToCore } from "@desktop/lib/policy";
import { vaultApi } from "@desktop/lib/vault";
import { ZPolicyType } from "@schemas/policy";
import { useMutation, useQueryClient } from "@tanstack/react-query";

export function useUpdateVaultPolicy({
  onSuccess,
}: {
  onSuccess?: () => void;
}) {
  const queryClient = useQueryClient();

  const { profileId } = useProfile();
  const { deviceId } = useDevice();
  const { queryKeys } = useQueryKey();
  const { vaultId } = useVaultId();

  return useMutation({
    mutationKey: ["core", "vault", vaultId, "policy"],
    mutationFn: async (values: ZPolicyType) => {
      if (!profileId || !deviceId || !vaultId) return;

      await vaultApi(vaultId).put(
        "/api/v1/policy",
        convertPolicyToCore(values, "VAULT"),
        {
          params: {
            userName: profileId,
            host: deviceId,
          },
        },
      );
    },
    onError: showErrorToast,
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: queryKeys.policy.vault(vaultId),
      });

      onSuccess?.();
    },
  });
}
