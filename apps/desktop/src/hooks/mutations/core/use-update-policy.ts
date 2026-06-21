import type { ZPolicyType } from "@blinkdisk/schemas/policy";
import { CustomError } from "@blinkdisk/utils/error";
import { showErrorToast } from "@blinkdisk/utils/error-toast";
import { useQueryKey } from "@desktop/hooks/use-query-key";
import { useVaultId } from "@desktop/hooks/use-vault-id";
import { convertPolicyToCore } from "@desktop/lib/policy";
import {
  type PolicyTarget,
  policyTargetId,
  policyTargetToKopiaParams,
} from "@desktop/lib/policy-target";
import { vaultApi } from "@desktop/lib/vault";
import { useMutation, useQueryClient } from "@tanstack/react-query";

export function useUpdatePolicy({
  target,
  onSuccess,
}: {
  target: PolicyTarget | null | undefined;
  onSuccess?: () => void;
}) {
  const queryClient = useQueryClient();
  const { queryKeys } = useQueryKey();
  const { vaultId } = useVaultId();

  return useMutation({
    mutationKey: [
      "core",
      "vault",
      vaultId,
      "policy",
      target ? policyTargetId(target) : "missing",
    ],
    mutationFn: async (values: ZPolicyType) => {
      if (!vaultId || !target) throw new CustomError("MISSING_REQUIRED_VALUE");

      await vaultApi(vaultId).put(
        "/api/v1/policy",
        convertPolicyToCore(values),
        {
          params: policyTargetToKopiaParams(target),
        },
      );
    },
    onError: showErrorToast,
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: queryKeys.policy.all,
        }),
        queryClient.invalidateQueries({
          queryKey: queryKeys.folder.all,
        }),
      ]);

      onSuccess?.();
    },
  });
}
