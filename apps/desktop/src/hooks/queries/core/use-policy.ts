import { getErrorCode } from "@blinkdisk/utils/error";
import { tryCatch } from "@blinkdisk/utils/try-catch";
import { useVaultStatus } from "@desktop/hooks/queries/use-vault-status";
import { useQueryKey } from "@desktop/hooks/use-query-key";
import { useVaultId } from "@desktop/hooks/use-vault-id";
import {
  type CorePolicy,
  convertPolicyFromCore,
  convertPolicyToCore,
  defaultVaultPolicy,
  emptyPolicy,
  getDefinedFields,
} from "@desktop/lib/policy";
import {
  type PolicyTarget,
  policyTargetId,
  policyTargetToKopiaParams,
  policyTargetToResolveParams,
} from "@desktop/lib/policy-target";
import { vaultApi } from "@desktop/lib/vault";
import { useQuery } from "@tanstack/react-query";
import { useMemo } from "react";

export function usePolicy(target: PolicyTarget | null | undefined) {
  const { queryKeys } = useQueryKey();
  const { vaultId } = useVaultId();
  const { running } = useVaultStatus();

  const targetId = useMemo(
    () => (target ? policyTargetId(target) : "missing"),
    [target],
  );

  return useQuery({
    queryKey: queryKeys.policy.target(vaultId, targetId),
    queryFn: async () => {
      if (!vaultId || !target) return null;

      const [definedRes, definedError] = await tryCatch(
        vaultApi(vaultId).get<CorePolicy & { code?: string }>(
          "/api/v1/policy",
          {
            params: policyTargetToKopiaParams(target),
          },
        ),
      );

      const definedErrorCode = getErrorCode(definedError);

      if (definedError && definedErrorCode !== "NOT_FOUND") throw definedError;

      const fallbackDefined =
        target.kind === "GLOBAL" ? defaultVaultPolicy : emptyPolicy;

      const definedCore =
        definedErrorCode === "NOT_FOUND"
          ? convertPolicyToCore(fallbackDefined)
          : definedRes?.data;

      const defined = convertPolicyFromCore(definedCore);
      if (!defined) return null;

      if (target.kind === "GLOBAL") {
        return {
          target,
          defined,
          effective: defined,
          definedFields: getDefinedFields(defined),
        };
      }

      const res = await vaultApi(vaultId).post<{
        defined: CorePolicy;
        effective: CorePolicy;
      }>(
        "/api/v1/policy/resolve",
        {
          ...(target.kind === "DRAFT_FOLDER" ? { updates: definedCore } : {}),
          numUpcomingSnapshotTimes: 0,
        },
        {
          params: policyTargetToResolveParams(target),
        },
      );

      const effective = convertPolicyFromCore(res.data.effective);
      if (!effective) return null;

      return {
        target,
        defined,
        effective,
        definedFields: getDefinedFields(defined),
      };
    },
    enabled: !!vaultId && !!target && running,
  });
}
