import { CustomError } from "@blinkdisk/utils/error";
import { showErrorToast } from "@blinkdisk/utils/error-toast";
import { type SelectedProfile, useProfile } from "@desktop/hooks/use-profile";
import { useQueryKey } from "@desktop/hooks/use-query-key";
import { useVaultId } from "@desktop/hooks/use-vault-id";
import { kopiaParamsFromProfile } from "@desktop/lib/profile";
import { vaultApi } from "@desktop/lib/vault";
import { useMutation, useQueryClient } from "@tanstack/react-query";

export function useDeleteFolder({
  onSuccess,
  profile: profileOverride,
}: {
  onSuccess?: () => void;
  profile?: SelectedProfile;
}) {
  const queryClient = useQueryClient();

  const { profile: routeSelectedProfile } = useProfile();
  const { queryKeys } = useQueryKey();
  const { vaultId } = useVaultId();
  const profile =
    profileOverride === undefined ? routeSelectedProfile : profileOverride;

  return useMutation({
    mutationKey: ["core", "folder", "delete"],
    mutationFn: async ({ path }: { path: string }) => {
      if (!vaultId || !profile) throw new CustomError("MISSING_REQUIRED_VALUE");

      await vaultApi(vaultId).post("/api/v1/snapshots/delete", {
        source: {
          ...kopiaParamsFromProfile(profile),
          path: path || "",
        },
        snapshotManifestIds: [],
        deleteSourceAndPolicy: true,
      });
    },
    onError: showErrorToast,
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: queryKeys.folder.list(vaultId, profile),
      });

      onSuccess?.();
    },
  });
}
