import { useFolderList } from "@desktop/hooks/queries/core/use-folder-list";
import { useVaultStatus } from "@desktop/hooks/queries/use-vault-status";
import { useQueryKey } from "@desktop/hooks/use-query-key";
import { useVaultId } from "@desktop/hooks/use-vault-id";
import {
  buildPolicyTree,
  type KopiaPolicyTarget,
} from "@desktop/lib/policy-target";
import { vaultApi } from "@desktop/lib/vault";
import { useQuery } from "@tanstack/react-query";
import { useMemo } from "react";

export function usePolicyTree() {
  const { running } = useVaultStatus();
  const { queryKeys } = useQueryKey();
  const { vaultId } = useVaultId();
  const { data: sources } = useFolderList({ unfiltered: true });

  const policies = useQuery({
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

  const tree = useMemo(() => {
    if (!policies.data || !sources) return null;

    return buildPolicyTree({
      policies: policies.data,
      sources,
    });
  }, [policies.data, sources]);

  return {
    ...policies,
    data: tree,
  };
}
