import { useSpace } from "@desktop/hooks/queries/use-space";
import { useVault } from "@desktop/hooks/queries/use-vault";
import { useProfile } from "@desktop/hooks/use-profile";
import { useQueryKey } from "@desktop/hooks/use-query-key";
import { useVaultId } from "@desktop/hooks/use-vault-id";
import { showErrorToast } from "@desktop/lib/error";
import { hashFolder } from "@desktop/lib/folder";
import { vaultApi } from "@desktop/lib/vault";
import { ZCreateFolderFormType } from "@schemas/folder";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import { CustomError } from "@utils/error";
import { tryCatch } from "@utils/try-catch";
import { usePostHog } from "posthog-js/react";

export function useCreateFolder({
  onSuccess,
  onError,
}: {
  onSuccess: () => void;
  onError?: (error: unknown) => void;
}) {
  const posthog = usePostHog();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { vaultId } = useVaultId();
  const { profileFilter } = useProfile();
  const { queryKeys } = useQueryKey();

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
      if (!vaultId || !profileFilter)
        throw new CustomError("MISSING_REQUIRED_VALUE");

      if (
        !values.force &&
        space &&
        vault &&
        vault.provider === "BLINKDISK_CLOUD"
      ) {
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
          ...(window.folderMockPolicy || {}),
          name: values.name,
          emoji: values.emoji,
          type: values.type || "folder",
        },
      });

      const id = await hashFolder({
        hostName: profileFilter.host,
        userName: profileFilter.userName,
        path: values.path,
      });

      return { id, vaultId };
    },
    onError: (error) => {
      onError?.(error);

      if (error.message === "FOLDER_TOO_LARGE") return;

      showErrorToast(error);
    },
    onSuccess: async (res) => {
      posthog.capture("folder_add", {
        vaultId: res.vaultId,
        folderId: res.id,
      });

      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: queryKeys.folder.list(vaultId, profileFilter),
        }),
        // Policies can be nested inside folders.
        queryClient.invalidateQueries({
          queryKey: queryKeys.policy.folders(),
        }),
      ]);

      await navigate({
        to: "/app/{-$vaultId}/{-$hostName}/{-$userName}/{-$folderId}",
        params: (params) => ({
          ...params,
          folderId: res.id,
        }),
      });

      onSuccess?.();
    },
  });
}
