import { CustomError } from "@blinkdisk/utils/error";
import { showErrorToast } from "@blinkdisk/utils/error-toast";
import { type ProfileFilter, useProfile } from "@desktop/hooks/use-profile";
import { useQueryKey } from "@desktop/hooks/use-query-key";
import { useVaultId } from "@desktop/hooks/use-vault-id";
import { vaultApi } from "@desktop/lib/vault";
import { useMutation, useQueryClient } from "@tanstack/react-query";

export function useDeleteFolder({
  onSuccess,
  profileFilter: profileFilterOverride,
}: {
  onSuccess?: () => void;
  profileFilter?: ProfileFilter;
}) {
  const queryClient = useQueryClient();

  const { profileFilter: routeProfileFilter } = useProfile();
  const { queryKeys } = useQueryKey();
  const { vaultId } = useVaultId();
  const profileFilter =
    profileFilterOverride === undefined
      ? routeProfileFilter
      : profileFilterOverride;

  return useMutation({
    mutationKey: ["core", "folder", "delete"],
    mutationFn: async ({ path }: { path: string }) => {
      if (!vaultId || !profileFilter)
        throw new CustomError("MISSING_REQUIRED_VALUE");

      await vaultApi(vaultId).post("/api/v1/snapshots/delete", {
        source: {
          ...profileFilter,
          path: path || "",
        },
        snapshotManifestIds: [],
        deleteSourceAndPolicy: true,
      });
    },
    onError: showErrorToast,
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: queryKeys.folder.list(vaultId, profileFilter),
      });

      onSuccess?.();
    },
  });
}
