import { useVaultStatus } from "@desktop/hooks/queries/use-vault-status";
import { useProfile } from "@desktop/hooks/use-profile";
import { useQueryKey } from "@desktop/hooks/use-query-key";
import { useVaultId } from "@desktop/hooks/use-vault-id";
import {
  convertPolicyFromCore,
  convertPolicyToCore,
  CorePolicy,
  defaultVaultPolicy,
} from "@desktop/lib/policy";
import { vaultApi } from "@desktop/lib/vault";
import { useQuery } from "@tanstack/react-query";
import { tryCatch } from "@utils/try-catch";

export function useVaultPolicy() {
  const { profileFilter } = useProfile();
  const { queryKeys, accountId } = useQueryKey();
  const { vaultId } = useVaultId();
  const { running } = useVaultStatus();

  return useQuery({
    queryKey: queryKeys.policy.vault(vaultId, profileFilter),
    queryFn: async () => {
      if (!profileFilter) return null;

      const [res, error] = await tryCatch(
        vaultApi(vaultId).get<CorePolicy & { code?: string }>(
          "/api/v1/policy",
          {
            params: profileFilter,
          },
        ),
      );

      if (error && "code" in error && error.code === "NOT_FOUND") {
        // Create the vault policy in
        // case it doesn't exist yet
        await vaultApi(vaultId).put(
          "/api/v1/policy",
          convertPolicyToCore(defaultVaultPolicy),
          {
            params: profileFilter,
          },
        );

        return {
          defined: defaultVaultPolicy,
          effective: defaultVaultPolicy,
        };
      }

      if (error) throw error;

      if (!res.data) return null;

      const policy = convertPolicyFromCore(res.data);
      if (!policy) return null;

      return {
        defined: policy,
        effective: policy,
      };
    },
    enabled: !!accountId && !!vaultId && !!profileFilter && running,
  });
}
