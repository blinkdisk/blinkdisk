import type { ZCreateFolderFormType } from "@blinkdisk/schemas/folder";
import { CustomError } from "@blinkdisk/utils/error";
import { showErrorToast } from "@blinkdisk/utils/error-toast";
import { tryCatch } from "@blinkdisk/utils/try-catch";
import { useSpace } from "@desktop/hooks/queries/use-space";
import { useVault } from "@desktop/hooks/queries/use-vault";
import { useAccountId } from "@desktop/hooks/use-account-id";
import { useLocalProfile } from "@desktop/hooks/use-local-profile";
import { useQueryKey } from "@desktop/hooks/use-query-key";
import { useVaultId } from "@desktop/hooks/use-vault-id";
import { buildFolderId, hashFolder } from "@desktop/lib/folder";
import { profileFromParts } from "@desktop/lib/profile";
import { vaultApi } from "@desktop/lib/vault";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import { usePostHog } from "posthog-js/react";
import { useMemo } from "react";

export function useCreateFolder({
  onSuccess,
  onError,
}: {
  onSuccess: () => void;
  onError?: (error: unknown) => void;
}) {
  const posthog = usePostHog();
  const navigate = useNavigate({ from: "/$accountId/$vaultId" });
  const queryClient = useQueryClient();

  const { accountId } = useAccountId();
  const { vaultId } = useVaultId();
  const { localHostName, localUserName } = useLocalProfile();
  const { queryKeys } = useQueryKey();
  const profile = useMemo(
    () =>
      profileFromParts({
        hostName: localHostName,
        userName: localUserName,
      }),
    [localHostName, localUserName],
  );

  const { data: vault } = useVault();
  const { data: space } = useSpace();

  return useMutation({
    mutationKey: ["folder", "create"],
    mutationFn: async (
      values: ZCreateFolderFormType & {
        force?: boolean;
        size: number | null;
      },
    ) => {
      if (!accountId || !vaultId || !profile)
        throw new CustomError("MISSING_REQUIRED_VALUE");

      if (!values.force && space && vault && vault.provider === "CLOUDBLINK") {
        let size = values.size;

        if (size === null) {
          const [res] = await tryCatch(
            async () => await window.electron.fs.folderSize(values.path),
          );

          if (res) size = res;
        }

        if (size !== null) {
          const available = space.capacity - space.used;
          if (size > available) throw new Error("FOLDER_TOO_LARGE");
        }
      }

      await vaultApi(vaultId).post("/api/v1/sources", {
        path: values.path,
        createSnapshot: false,
        policy: {
          name: values.name,
          emoji: values.emoji,
        },
      });

      const id = buildFolderId({
        device: profile.deviceName,
        user: profile.userName,
        path: values.path,
      });

      const folderFingerprint = await hashFolder({
        hostName: profile.deviceName,
        userName: profile.userName,
        path: values.path,
      });

      return { accountId, folderFingerprint, id, profile, vaultId };
    },
    onError: (error) => {
      onError?.(error);

      if (error.message === "FOLDER_TOO_LARGE") return;

      showErrorToast(error);
    },
    onSuccess: async (res) => {
      posthog.capture("folder_add", {
        vaultId: res.vaultId,
        folderId: res.folderFingerprint,
      });

      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: queryKeys.folder.list(vaultId, res.profile),
        }),
        // Policies can be nested inside folders.
        queryClient.invalidateQueries({
          queryKey: queryKeys.policy.folders(),
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
