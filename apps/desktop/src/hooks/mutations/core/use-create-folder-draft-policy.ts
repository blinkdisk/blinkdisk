import type { ZCreateFolderFormType } from "@blinkdisk/schemas/folder";
import { CustomError } from "@blinkdisk/utils/error";
import { showErrorToast } from "@blinkdisk/utils/error-toast";
import { useQueryKey } from "@desktop/hooks/use-query-key";
import { useVaultId } from "@desktop/hooks/use-vault-id";
import { convertPolicyToCore, emptyPolicy } from "@desktop/lib/policy";
import {
  createDraftPolicyTarget,
  policyTargetToKopiaParams,
  policyTargetToSearch,
} from "@desktop/lib/policy-target";
import { vaultApi } from "@desktop/lib/vault";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";

export function useCreateFolderDraftPolicy({
  onSuccess,
}: {
  onSuccess?: () => void;
} = {}) {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { queryKeys } = useQueryKey();
  const { vaultId } = useVaultId();

  return useMutation({
    mutationKey: ["core", "folder", "policy", "draft", "create"],
    mutationFn: async (
      values: ZCreateFolderFormType & {
        hostName: string | null;
        userName: string | null;
      },
    ) => {
      if (!vaultId || !values.hostName || !values.userName)
        throw new CustomError("MISSING_REQUIRED_VALUE");

      const target = createDraftPolicyTarget({
        hostName: values.hostName,
        userName: values.userName,
        path: values.path,
      });

      await vaultApi(vaultId).put(
        "/api/v1/policy",
        convertPolicyToCore({
          ...emptyPolicy,
          name: values.name,
          emoji: values.emoji,
        }),
        {
          params: policyTargetToKopiaParams(target),
        },
      );

      return target;
    },
    onError: showErrorToast,
    onSuccess: async (target) => {
      await queryClient.invalidateQueries({
        queryKey: queryKeys.policy.all,
      });

      await navigate({
        to: "/{-$accountId}/{-$vaultId}/{-$hostName}/{-$userName}/policies",
        search: policyTargetToSearch(target),
      });

      onSuccess?.();
    },
  });
}
