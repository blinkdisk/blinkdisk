import { useAppTranslation } from "@blinkdisk/hooks/use-app-translation";
import { ZRestoreDirectoryType } from "@blinkdisk/schemas/directory";
import { CustomError } from "@blinkdisk/utils/error";
import { showErrorToast } from "@blinkdisk/utils/error-toast";
import { DirectoryItem } from "@desktop/hooks/queries/core/use-directory";
import { useFolderId } from "@desktop/hooks/use-folder-id";
import { useQueryKey } from "@desktop/hooks/use-query-key";
import { useVaultId } from "@desktop/hooks/use-vault-id";
import { useMutation, useQueryClient } from "@tanstack/react-query";

export function useStartRestore(options?: { onSuccess?: () => void }) {
  const queryClient = useQueryClient();

  const { t } = useAppTranslation("directory.table.restore");

  const { vaultId } = useVaultId();
  const { folderId } = useFolderId();
  const { queryKeys } = useQueryKey();

  const logRestoreMutation = (
    message: string,
    data?: Record<string, unknown>,
  ) => {
    console.info(`[restore:mutation] ${message}`, data || "");
  };

  return useMutation({
    mutationKey: ["file", "restore"],
    mutationFn: async (
      options:
        | { variant: "single"; item: DirectoryItem }
        | { variant: "multiple"; items: DirectoryItem[] }
        | {
            variant: "directory";
            objectId: string;
            values: ZRestoreDirectoryType;
          },
    ) => {
      logRestoreMutation("start requested", {
        variant: options.variant,
        vaultId,
        folderId,
        payload:
          options.variant === "single"
            ? {
                itemName: options.item.name,
                itemType: options.item.type,
                objectId: options.item.objectId,
              }
            : options.variant === "multiple"
              ? {
                  itemCount: options.items.length,
                  items: options.items.map((item) => ({
                    name: item.name,
                    type: item.type,
                    objectId: item.objectId,
                  })),
                }
              : {
                  objectId: options.objectId,
                  values: options.values,
                },
      });

      if (!vaultId || !folderId)
        throw new CustomError("MISSING_REQUIRED_VALUE");

      if (options.variant === "single") {
        const result = await window.electron.vault.restore.single({
          vaultId,
          folderId,
          item: options.item,
          dialogTitle: t("single.dialog.title"),
        });
        logRestoreMutation("single invoke result", {
          result,
          itemName: options.item.name,
          itemType: options.item.type,
          objectId: options.item.objectId,
        });
        return result;
      }

      if (options.variant === "multiple") {
        const result = await window.electron.vault.restore.multiple({
          vaultId,
          folderId,
          items: options.items,
          dialogTitle: t("multiple.dialog.title"),
        });
        logRestoreMutation("multiple invoke result", {
          result,
          itemCount: options.items.length,
        });
        return result;
      }

      if (options.variant === "directory") {
        const result = await window.electron.vault.restore.directory({
          vaultId,
          folderId,
          options: options.values,
          objectId: options.objectId,
        });
        logRestoreMutation("directory invoke result", {
          result,
          objectId: options.objectId,
          values: options.values,
        });
        return result;
      }
    },
    onError: (error) => {
      console.error("[restore:mutation] start failed", error);
      showErrorToast(error);
    },
    onSuccess: async (res) => {
      logRestoreMutation("success callback", { result: res, folderId });

      if (res !== true) return;

      await queryClient.invalidateQueries({
        queryKey: queryKeys.folder.restores(folderId),
      });

      logRestoreMutation("restores query invalidated", { folderId });
      options?.onSuccess?.();
    },
  });
}
