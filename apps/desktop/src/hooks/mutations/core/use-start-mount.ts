import { CoreMountItem, useMount } from "@desktop/hooks/queries/core/use-mount";
import { useBackup } from "@desktop/hooks/use-backup";
import { useQueryKey } from "@desktop/hooks/use-query-key";
import { useVaultId } from "@desktop/hooks/use-vault-id";
import { showErrorToast } from "@desktop/lib/error";
import { vaultApi } from "@desktop/lib/vault";
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
        const res = await vaultApi(vaultId).post<
          CoreMountItem & { error?: string }
        >("/api/v1/mounts", {
          root: backup?.rootID,
        });

        if (res.data.error) throw new Error(res.data.error);

        newMount = res.data;
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
