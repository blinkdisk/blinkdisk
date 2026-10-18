import { CustomError } from "@blinkdisk/utils/error";
import { showErrorToast } from "@blinkdisk/utils/error-toast";
import { tryCatch } from "@blinkdisk/utils/try-catch";
import { type SelectedProfile, useProfile } from "@desktop/hooks/use-profile";
import { useQueryKey } from "@desktop/hooks/use-query-key";
import { useVaultId } from "@desktop/hooks/use-vault-id";
import { kopiaParamsFromProfile } from "@desktop/lib/profile";
import { vaultApi } from "@desktop/lib/vault";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { usePostHog } from "posthog-js/react";

export function useStartBackup(
  options: {
    profile?: SelectedProfile;
    onSuccess?: () => void;
    onError?: () => void;
  } = {},
) {
  const queryClient = useQueryClient();
  const posthog = usePostHog();

  const { vaultId } = useVaultId();
  const { profile: routeSelectedProfile } = useProfile();
  const { queryKeys } = useQueryKey();
  const profile =
    options.profile === undefined ? routeSelectedProfile : options.profile;

  return useMutation({
    mutationKey: ["vault", vaultId, "backup"],
    mutationFn: async (options: { path?: string }) => {
      if (!vaultId || !profile) throw new CustomError("MISSING_REQUIRED_VALUE");

      await vaultApi(vaultId).post(
        "/api/v1/sources/upload",
        {},
        {
          params: {
            ...kopiaParamsFromProfile(profile),
            ...(options?.path && { path: options.path }),
          },
        },
      );
    },
    onError: (error) => {
      options.onError?.();
      showErrorToast(error);
    },
    onSuccess: async (_, values) => {
      options.onSuccess?.();
      tryCatch(() =>
        posthog?.capture("backup_start", {
          vaultId,
          scope: values.path ? "source" : "all",
        }),
      );

      await queryClient.invalidateQueries({
        queryKey: queryKeys.source.list(vaultId, profile),
      });
    },
  });
}
