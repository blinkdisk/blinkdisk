import type { ZPolicyType } from "@blinkdisk/schemas/policy";
import { CustomError } from "@blinkdisk/utils/error";
import { showErrorToast } from "@blinkdisk/utils/error-toast";
import { type SelectedProfile, useProfile } from "@desktop/hooks/use-profile";
import { useQueryKey } from "@desktop/hooks/use-query-key";
import { useVaultId } from "@desktop/hooks/use-vault-id";
import { convertPolicyToCore } from "@desktop/lib/policy";
import { kopiaParamsFromProfile } from "@desktop/lib/profile";
import { vaultApi } from "@desktop/lib/vault";
import { useMutation, useQueryClient } from "@tanstack/react-query";

export function useUpdateVaultPolicy({
  onSuccess,
  profile: profileOverride,
}: {
  onSuccess?: () => void;
  profile?: SelectedProfile;
} = {}) {
  const queryClient = useQueryClient();

  const { profile: routeSelectedProfile } = useProfile();
  const { queryKeys } = useQueryKey();
  const { vaultId } = useVaultId();
  const profile =
    profileOverride === undefined ? routeSelectedProfile : profileOverride;

  return useMutation({
    mutationKey: ["core", "vault", vaultId, "policy"],
    mutationFn: async (values: ZPolicyType) => {
      if (!vaultId || !profile) throw new CustomError("MISSING_REQUIRED_VALUE");

      await vaultApi(vaultId).put(
        "/api/v1/policy",
        convertPolicyToCore(values),
        {
          params: kopiaParamsFromProfile(profile),
        },
      );
    },
    onError: showErrorToast,
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: queryKeys.policy.vault(vaultId, profile),
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
