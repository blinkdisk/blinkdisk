import { useVault } from "@desktop/hooks/queries/use-vault";
import { useVaultSpace } from "@desktop/hooks/queries/use-vault-space";
import { useDevice } from "@desktop/hooks/use-device";
import { useProfile } from "@desktop/hooks/use-profile";
import { useQueryKey } from "@desktop/hooks/use-query-key";
import { useVaultId } from "@desktop/hooks/use-vault-id";
import { showErrorToast } from "@desktop/lib/error";
import { hashFolder } from "@desktop/lib/folder";
import { trpc } from "@desktop/lib/trpc";
import { ZCreateFolderFormType } from "@schemas/folder";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import { tryCatch } from "@utils/try-catch";
import { usePostHog } from "posthog-js/react";

export type CreateFolderResponse = Awaited<
  ReturnType<typeof trpc.folder.create.mutate>
>;

export function useCreateFolder({
  onSuccess,
  onError,
}: {
  onSuccess: (res: CreateFolderResponse) => void;
  onError?: (error: any) => void;
}) {
  const posthog = usePostHog();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { vaultId } = useVaultId();
  const { deviceId } = useDevice();
  const { profileId } = useProfile();
  const { queryKeys } = useQueryKey();

  const { data: vault } = useVault();
  const { data: space } = useVaultSpace();

  return useMutation({
    mutationKey: ["folder", "create"],
    mutationFn: async (values: ZCreateFolderFormType & { force?: boolean }) => {
      if (!vaultId || !deviceId || !profileId)
        throw new Error("Missing fields");

      if (
        !values.force &&
        space &&
        vault &&
        vault.provider === "BLINKDISK_CLOUD"
      ) {
        const [size] = await tryCatch(
          async () => await window.electron.fs.folderSize(values.path),
        );

        if (size) {
          const available = space.capacity - space.used;
          if (size > available) throw new Error("FOLDER_TOO_LARGE");
        }
      }

      const response = await window.electron.vault.fetch({
        vaultId: vaultId || "",
        method: "POST",
        path: "/api/v1/sources",
        data: {
          path: values.path,
          createSnapshot: false,
          policy: {
            name: values.name,
            emoji: values.emoji,
          },
        },
      });

      if (response.error) throw new Error(response.error);

      const id = await hashFolder({
        deviceId,
        profileId,
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

      await queryClient.invalidateQueries({
        queryKey: queryKeys.folder.list(vaultId),
      });

      await navigate({
        to: "/app/{-$deviceId}/{-$profileId}/{-$vaultId}/{-$folderId}",
        params: (params) => ({
          ...params,
          folderId: res.id,
        }),
      });

      onSuccess?.(res);
    },
  });
}
