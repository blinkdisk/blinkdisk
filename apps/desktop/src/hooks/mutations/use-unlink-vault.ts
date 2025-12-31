import { CoreFolderItem } from "@desktop/hooks/queries/core/use-folder-list";
import { useQueryKey } from "@desktop/hooks/use-query-key";
import { showErrorToast } from "@desktop/lib/error";
import { trpc } from "@desktop/lib/trpc";
import { vaultApi } from "@desktop/lib/vault";
import { useMutation, useQueryClient } from "@tanstack/react-query";

export function useUnlinkVault({ onSuccess }: { onSuccess?: () => void }) {
  const queryClient = useQueryClient();
  const { queryKeys } = useQueryKey();

  return useMutation({
    mutationKey: ["core", "vault", "unlink"],
    mutationFn: async ({ vaultId }: { vaultId: string }) => {
      const vault = await trpc.vault.get.query({
        vaultId,
      });

      await trpc.vault.unlink.mutate({
        vaultId,
      });

      try {
        const sources = await vaultApi(vaultId).get<{
          sources: CoreFolderItem[];
          error?: string;
        }>("/api/v1/sources", {
          params: {
            host: vault.deviceId || "",
            userName: vault.profileId || "",
          },
        });

        for (const folder of sources.data.sources) {
          await vaultApi(vaultId).post("/api/v1/snapshots/delete", {
            source: {
              path: folder.source.path || "",
              userName: vault.profileId || "",
              host: vault.deviceId || "",
            },
            snapshotManifestIds: [],
            deleteSourceAndPolicy: true,
          });
        }

        await vaultApi(vaultId).delete("/api/v1/policy", {
          params: {
            userName: vault.profileId,
            host: vault.deviceId,
          },
        });
      } catch (e) {
        console.error(e);
      }
    },
    onError: showErrorToast,
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: queryKeys.vault.all,
        }),
      ]);

      onSuccess?.();
    },
  });
}
