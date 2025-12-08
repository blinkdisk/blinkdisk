import { CoreMountItem, useMount } from "@desktop/hooks/queries/core/use-mount";
import { useBackup } from "@desktop/hooks/use-backup";
import { useQueryKey } from "@desktop/hooks/use-query-key";
import { useVaultId } from "@desktop/hooks/use-vault-id";
import { showErrorToast } from "@desktop/lib/error";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useSearch } from "@tanstack/react-router";

export function useStartMount() {
  const queryClient = useQueryClient();

  const { vaultId } = useVaultId();
  const { queryKeys } = useQueryKey();
  const { data: backup } = useBackup();
  const { data: mount } = useMount();
  const { path } = useSearch({ strict: false });

  return useMutation({
    mutationKey: ["mount", "start"],
    mutationFn: async () => {
      if (!vaultId || !backup) return;

      let newMount = mount;
      if (!newMount) {
        newMount = (await window.electron.vault.fetch({
          vaultId,
          method: "POST",
          path: `/api/v1/mounts`,
          data: {
            root: backup?.rootID,
          },
        })) as CoreMountItem;
      }

      const platform = await window.electron.os.platform();

      let directoryPath = newMount.path;
      if (path && path.length) {
        const seperator = platform === "windows" ? "\\" : "/";
        const subDirectories = path.map(({ name }) => name).join(seperator);
        directoryPath = `${directoryPath}${seperator}${subDirectories}`;
      }

      window.electron.shell.open.folder(directoryPath);
    },
    onError: showErrorToast,
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: queryKeys.directory.mount(backup?.rootID),
      });
    },
  });
}
