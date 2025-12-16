import { useVaultStatus } from "@desktop/hooks/queries/use-vault-status";
import { useDevice } from "@desktop/hooks/use-device";
import { useProfile } from "@desktop/hooks/use-profile";
import { useQueryKey } from "@desktop/hooks/use-query-key";
import { useVaultId } from "@desktop/hooks/use-vault-id";
import {
  convertPolicyFromCore,
  CorePolicy,
  defaultVaultPolicy,
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

      const res = await vaultApi(vaultId).get<CorePolicy & { code?: string }>(
        "/api/v1/policy",
        {
          params: {
            userName: profileId,
            host: deviceId,
          },
        },
      );

      if (!res.data) return null;

      if (res.data.code === "NOT_FOUND")
        return {
          defined: defaultVaultPolicy,
          effective: defaultVaultPolicy,
        };

      const policy = convertPolicyFromCore(res.data);
      if (!policy) return null;

      return {
        defined: policy,
        effective: policy,
      };
    },
    enabled: !!accountId && !!vaultId && running,
  });
}
