import { useVaultPolicy } from "@desktop/hooks/queries/core/use-vault-policy";
import { useFolder } from "@desktop/hooks/use-folder";
import { useProfile } from "@desktop/hooks/use-profile";
import { useQueryKey } from "@desktop/hooks/use-query-key";
import { useVaultId } from "@desktop/hooks/use-vault-id";
import { showErrorToast } from "@desktop/lib/error";
import { convertPolicyToCore } from "@desktop/lib/policy";
import { vaultApi } from "@desktop/lib/vault";
import { ZPolicyType } from "@schemas/policy";
import { CustomError } from "@utils/error";
import { useMutation, useQueryClient } from "@tanstack/react-query";

export function useUpdateFolderPolicy({
  folderId,
  onSuccess,
  mock,
}: {
  folderId?: string;
  onSuccess?: () => void;
  mock?: { path: string };
}) {
  const queryClient = useQueryClient();

  const { queryKeys } = useQueryKey();
  const { profileFilter } = useProfile();
  const { vaultId } = useVaultId();
  const { data: vaultPolicy } = useVaultPolicy();
  const { data: folder } = useFolder(folderId);

  return useMutation({
    mutationKey: ["core", "vault", folder?.id, "policy"],
    mutationFn: async (values: ZPolicyType) => {
      if (!vaultId || !vaultPolicy || !profileFilter) throw new CustomError("MISSING_REQUIRED_VALUE");

      const policy = convertPolicyToCore(values);

      if (mock) {
        // eslint-disable-next-line
        window.folderMockPolicy = policy;
      } else {
        if (!folder) throw new Error("Folder not found, but mock is undefined");

        await vaultApi(vaultId).put("/api/v1/policy", policy, {
          params: {
            ...profileFilter,
            path: folder.source.path,
          },
        });
      }
    },
    onError: showErrorToast,
    onSuccess: async () => {
      if (mock) {
        await queryClient.invalidateQueries({
          queryKey: queryKeys.policy.folder("mock"),
        });
      } else {
        await Promise.all([
          queryClient.invalidateQueries({
            queryKey: queryKeys.policy.folder(folder?.id),
          }),
          // Policies can be nested inside folders.
          queryClient.invalidateQueries({
            queryKey: queryKeys.policy.folders(),
          }),
          // Name and emoji might have changed.
          queryClient.invalidateQueries({
            queryKey: queryKeys.folder.list(vaultId, profileFilter),
          }),
        ]);
      }

      onSuccess?.();
    },
  });
}
