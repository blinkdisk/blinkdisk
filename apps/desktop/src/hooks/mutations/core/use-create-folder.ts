import { useVault } from "@desktop/hooks/queries/use-vault";
import { useVaultSpace } from "@desktop/hooks/queries/use-vault-space";
import { useAccountId } from "@desktop/hooks/use-account-id";
import { useDevice } from "@desktop/hooks/use-device";
import { useProfile } from "@desktop/hooks/use-profile";
import { useVaultId } from "@desktop/hooks/use-vault-id";
import { showErrorToast } from "@desktop/lib/error";
import { trpc } from "@desktop/lib/trpc";
import { useAppTranslation } from "@hooks/use-app-translation";
import { ZCreateFolderFormType } from "@schemas/folder";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { tryCatch } from "@utils/try-catch";
import { toast } from "sonner";

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
  const queryClient = useQueryClient();

  const { t } = useAppTranslation("folder.createDialog.success");

  const { vaultId } = useVaultId();
  const { deviceId } = useDevice();
  const { profileId } = useProfile();
  const { accountId } = useAccountId();

  const { data: vault } = useVault();
  const { data: space } = useVaultSpace();

  return useMutation({
    mutationKey: ["folder", "create"],
    mutationFn: async (values: ZCreateFolderFormType & { force?: boolean }) => {
      if (!vaultId || !deviceId || !profileId) return;

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
      return response;
    },
    onError: (error) => {
      onError?.(error);

      if (error.message === "FOLDER_TOO_LARGE") return;

      showErrorToast(error);
    },
    onSuccess: async (res) => {
      await queryClient.invalidateQueries({
        queryKey: [accountId, "core", "folder", "list", vaultId],
      });

      toast.success(t("title"), {
        description: t("description"),
      });

      onSuccess?.(res);
    },
  });
}
