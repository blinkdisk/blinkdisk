import type { ZPolicyType } from "@blinkdisk/schemas/policy";
import { CustomError } from "@blinkdisk/utils/error";
import { showErrorToast } from "@blinkdisk/utils/error-toast";
import { tryCatch } from "@blinkdisk/utils/try-catch";
import { useSpace } from "@desktop/hooks/queries/use-space";
import { useVault } from "@desktop/hooks/queries/use-vault";
import { useAccountId } from "@desktop/hooks/use-account-id";
import { useQueryKey } from "@desktop/hooks/use-query-key";
import { useVaultId } from "@desktop/hooks/use-vault-id";
import { buildFolderId, hashFolder } from "@desktop/lib/folder";
import { convertPolicyToCore } from "@desktop/lib/policy";
import {
  type PolicyTarget,
  policyTargetToKopiaParams,
} from "@desktop/lib/policy-target";
import { vaultApi } from "@desktop/lib/vault";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import { usePostHog } from "posthog-js/react";

export function useActivateFolderDraftPolicy({
  target,
  onError,
  onSuccess,
}: {
  target: Extract<PolicyTarget, { kind: "DRAFT_FOLDER" }> | null | undefined;
  onError?: (error: unknown) => void;
  onSuccess?: () => void;
}) {
  const posthog = usePostHog();
  const navigate = useNavigate({ from: "/$accountId/$vaultId" });
  const queryClient = useQueryClient();
  const { queryKeys } = useQueryKey();
  const { accountId } = useAccountId();
  const { vaultId } = useVaultId();
  const { data: vault } = useVault();
  const { data: space } = useSpace();

  return useMutation({
    mutationKey: ["core", "folder", "policy", "draft", "activate"],
    mutationFn: async ({
      policy,
      force,
    }: {
      policy: ZPolicyType;
      force?: boolean;
    }) => {
      const draftTarget = target;

      if (!accountId || !vaultId || !draftTarget)
        throw new CustomError("MISSING_REQUIRED_VALUE");

      if (!force && space && vault && vault.provider === "CLOUDBLINK") {
        const [size] = await tryCatch(
          async () => await window.electron.fs.folderSize(draftTarget.path),
        );

        if (size !== null && size !== undefined) {
          const available = space.capacity - space.used;
          if (size > available) throw new Error("FOLDER_TOO_LARGE");
        }
      }

      await vaultApi(vaultId).post("/api/v1/sources", {
        path: draftTarget.path,
        createSnapshot: false,
        policy: convertPolicyToCore(policy),
      });

      await vaultApi(vaultId).delete("/api/v1/policy", {
        params: policyTargetToKopiaParams(draftTarget),
      });

      const id = buildFolderId({
        device: draftTarget.hostName,
        user: draftTarget.userName,
        path: draftTarget.path,
      });

      const folderFingerprint = await hashFolder({
        hostName: draftTarget.hostName,
        userName: draftTarget.userName,
        path: draftTarget.path,
      });

      return { accountId, folderFingerprint, id, vaultId, target: draftTarget };
    },
    onError: (error) => {
      onError?.(error);

      if (
        error &&
        typeof error === "object" &&
        "message" in error &&
        error.message === "FOLDER_TOO_LARGE"
      )
        return;

      showErrorToast(error);
    },
    onSuccess: async (res) => {
      posthog.capture("folder_add", {
        vaultId: res.vaultId,
        folderId: res.folderFingerprint,
      });

      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: queryKeys.folder.list(res.vaultId, {
            deviceName: res.target.hostName,
            userName: res.target.userName,
          }),
        }),
        queryClient.invalidateQueries({
          queryKey: queryKeys.policy.all,
        }),
      ]);

      await navigate({
        to: "/$accountId/$vaultId/$folderId",
        params: (params) => ({
          ...params,
          folderId: res.id,
        }),
      });

      onSuccess?.();
    },
  });
}
