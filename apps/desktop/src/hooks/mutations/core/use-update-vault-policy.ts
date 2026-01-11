import { useProfile } from "@desktop/hooks/use-profile";
import { useQueryKey } from "@desktop/hooks/use-query-key";
import { useVaultId } from "@desktop/hooks/use-vault-id";
import { showErrorToast } from "@desktop/lib/error";
import { convertPolicyToCore } from "@desktop/lib/policy";
import { vaultApi } from "@desktop/lib/vault";
import { ZPolicyType } from "@schemas/policy";
import { CustomError } from "@utils/error";
import { useMutation, useQueryClient } from "@tanstack/react-query";

export function useUpdateVaultPolicy({
  onSuccess,
}: {
  onSuccess?: () => void;
} = {}) {
  const queryClient = useQueryClient();

  const { profileFilter } = useProfile();
  const { queryKeys } = useQueryKey();
  const { vaultId } = useVaultId();

  return useMutation({
    mutationKey: ["core", "vault", vaultId, "policy"],
    mutationFn: async (values: ZPolicyType) => {
      if (!vaultId || !profileFilter) throw new CustomError("MISSING_REQUIRED_VALUE");

      await vaultApi(vaultId).put(
        "/api/v1/policy",
        convertPolicyToCore(values),
        {
          params: profileFilter,
        },
      );
    },
    onError: showErrorToast,
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: queryKeys.policy.vault(vaultId, profileFilter),
        }),
        // Folders depend on the vault policy,
        // so we need to invalidate them as well.
        queryClient.invalidateQueries({
          queryKey: queryKeys.policy.folders(),
        }),
      ]);

      onSuccess?.();
    },
  });
}
