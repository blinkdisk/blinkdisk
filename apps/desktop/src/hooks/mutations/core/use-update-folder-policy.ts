import type { ZPolicyType } from "@blinkdisk/schemas/policy";
import { CustomError } from "@blinkdisk/utils/error";
import { showErrorToast } from "@blinkdisk/utils/error-toast";
import { useVaultPolicy } from "@desktop/hooks/queries/core/use-vault-policy";
import { useFolder } from "@desktop/hooks/use-folder";
import { type SelectedProfile, useProfile } from "@desktop/hooks/use-profile";
import { useQueryKey } from "@desktop/hooks/use-query-key";
import { useVaultId } from "@desktop/hooks/use-vault-id";
import { convertPolicyToCore } from "@desktop/lib/policy";
import { kopiaParamsFromProfile } from "@desktop/lib/profile";
import { vaultApi } from "@desktop/lib/vault";
import { useMutation, useQueryClient } from "@tanstack/react-query";

export function useUpdateFolderPolicy({
  folderId,
  onSuccess,
  mock,
  profile: profileOverride,
}: {
  folderId?: string;
  onSuccess?: () => void;
  mock?: { path: string };
  profile?: SelectedProfile;
}) {
  const queryClient = useQueryClient();

  const { queryKeys } = useQueryKey();
  const { profile: routeSelectedProfile } = useProfile();
  const { vaultId } = useVaultId();
  const profile =
    profileOverride === undefined ? routeSelectedProfile : profileOverride;
  const { data: vaultPolicy } = useVaultPolicy({ profile });
  const { data: folder } = useFolder(folderId, { profile });

  return useMutation({
    mutationKey: ["core", "vault", folder?.id, "policy"],
    mutationFn: async (values: ZPolicyType) => {
      if (!vaultId || !vaultPolicy || !profile)
        throw new CustomError("MISSING_REQUIRED_VALUE");

      const policy = convertPolicyToCore(values);

      if (mock) {
        window.folderMockPolicy = policy;
      } else {
        if (!folder) throw new Error("Folder not found, but mock is undefined");

        await vaultApi(vaultId).put("/api/v1/policy", policy, {
          params: {
            ...kopiaParamsFromProfile(profile),
            path: folder.source.path,
          },
        });
      }
    },
    onError: showErrorToast,
    onSuccess: async () => {
      if (mock) {
        await queryClient.invalidateQueries({
          queryKey: queryKeys.policy.folder("mock", profile),
        });
      } else {
        await Promise.all([
          queryClient.invalidateQueries({
            queryKey: queryKeys.policy.folder(folder?.id, profile),
          }),
          // Policies can be nested inside folders.
          queryClient.invalidateQueries({
            queryKey: queryKeys.policy.folders(),
          }),
          // Name and emoji might have changed.
          queryClient.invalidateQueries({
            queryKey: queryKeys.folder.list(vaultId, profile),
          }),
        ]);
      }

      onSuccess?.();
    },
  });
}
