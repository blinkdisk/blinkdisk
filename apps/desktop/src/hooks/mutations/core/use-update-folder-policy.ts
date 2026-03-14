import { useVaultPolicy } from "#hooks/queries/core/use-vault-policy";
import { useFolder } from "#hooks/use-folder";
import { useProfile } from "#hooks/use-profile";
import { useQueryKey } from "#hooks/use-query-key";
import { useVaultId } from "#hooks/use-vault-id";
import { showErrorToast } from "#lib/error";
import { convertPolicyToCore } from "#lib/policy";
import { vaultApi } from "#lib/vault";
import { ZPolicyType } from "@schemas/policy";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { CustomError } from "@utils/error";

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
      if (!vaultId || !vaultPolicy || !profileFilter)
        throw new CustomError("MISSING_REQUIRED_VALUE");

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
