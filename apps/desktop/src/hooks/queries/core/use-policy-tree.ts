import { useSourceList } from "@desktop/hooks/queries/core/use-source-list";
import { useVaultStatus } from "@desktop/hooks/queries/use-vault-status";
import { useQueryKey } from "@desktop/hooks/use-query-key";
import { useVaultId } from "@desktop/hooks/use-vault-id";
import {
  buildPolicyTree,
  type KopiaPolicyTarget,
} from "@desktop/lib/policy-target";
import { vaultApi } from "@desktop/lib/vault";
import { useQuery } from "@tanstack/react-query";

export function usePolicyTree() {
  const { running } = useVaultStatus();
  const { queryKeys } = useQueryKey();
  const { vaultId } = useVaultId();
  const { data: sources } = useSourceList({
    includeDrafts: true,
    unfiltered: true,
  });

  const { data: policies, isPending } = useQuery({
    queryKey: queryKeys.policy.tree(vaultId),
    queryFn: async () => {
      const res = await vaultApi(vaultId).get<{
        policies: {
          target: KopiaPolicyTarget;
        }[];
      }>("/api/v1/policies");

      return res.data.policies;
    },
    enabled: !!vaultId && running,
  });

  const tree = (() => {
    if (!policies || !sources) return null;

    return buildPolicyTree({
      policies,
      sources,
    });
  })();

  return {
    data: tree,
    isPending,
  };
}
