import { useVaultStatus } from "@desktop/hooks/queries/use-vault-status";
import { useAccountId } from "@desktop/hooks/use-account-id";
import { useDevice } from "@desktop/hooks/use-device";
import { useProfile } from "@desktop/hooks/use-profile";
import { useVaultId } from "@desktop/hooks/use-vault-id";
import { convertPolicyFromCore, defaultPolicy } from "@desktop/lib/policy";
import { useQuery } from "@tanstack/react-query";

export function useVaultPolicy() {
  const { profileId } = useProfile();
  const { deviceId } = useDevice();
  const { accountId } = useAccountId();
  const { vaultId } = useVaultId();
  const { running } = useVaultStatus();

  return useQuery({
    queryKey: [accountId, "core", "policy", vaultId],
    queryFn: async () => {
      if (!deviceId || !profileId || !vaultId) return null;

      const data = await window.electron.vault.fetch({
        vaultId: vaultId!,
        method: "GET",
        path: "/api/v1/policy",
        search: {
          userName: profileId,
          host: deviceId,
        },
      });

      if (!data) return null;

      if (data.error || data.code) {
        if (data.code === "NOT_FOUND") {
          // Used for backwards compatibility for the first couple of vaults created,
          // and in case the policy copy on vault link fails.
          return defaultPolicy;
        }

        throw new Error(data.error);
      }

      return convertPolicyFromCore(data, "VAULT");
    },
    refetchInterval: 1000,
    enabled: !!accountId && !!vaultId && running,
  });
}
