import { useVaultStatus } from "@desktop/hooks/queries/use-vault-status";
import { useDevice } from "@desktop/hooks/use-device";
import { useProfile } from "@desktop/hooks/use-profile";
import { useQueryKey } from "@desktop/hooks/use-query-key";
import { useVaultId } from "@desktop/hooks/use-vault-id";
import {
  convertPolicyFromCore,
  CorePolicy,
  defaultPolicy,
} from "@desktop/lib/policy";
import { vaultApi } from "@desktop/lib/vault";
import { useQuery } from "@tanstack/react-query";

export function useVaultPolicy() {
  const { profileId } = useProfile();
  const { deviceId } = useDevice();
  const { queryKeys, accountId } = useQueryKey();
  const { vaultId } = useVaultId();
  const { running } = useVaultStatus();

  return useQuery({
    queryKey: queryKeys.policy.vault(vaultId),
    queryFn: async () => {
      if (!deviceId || !profileId || !vaultId) return null;

      const res = await vaultApi(vaultId).get<
        CorePolicy & { error?: string; code?: string }
      >("/api/v1/policy", {
        params: {
          userName: profileId,
          host: deviceId,
        },
      });

      if (!res.data) return null;

      if (res.data.error || res.data.code) {
        if (res.data.code === "NOT_FOUND") {
          // Used for backwards compatibility for the first couple of vaults created,
          // and in case the policy copy on vault link fails.
          return defaultPolicy;
        }

        throw new Error(res.data.error);
      }

      return convertPolicyFromCore(res.data, "VAULT");
    },
    enabled: !!accountId && !!vaultId && running,
  });
}
