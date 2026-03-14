import { CoreMountItem, useMount } from "#hooks/queries/core/use-mount";
import { useBackup } from "#hooks/use-backup";
import { useQueryKey } from "#hooks/use-query-key";
import { useVaultId } from "#hooks/use-vault-id";
import { showErrorToast } from "#lib/error";
import { vaultApi } from "#lib/vault";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useSearch } from "@tanstack/react-router";
import { CustomError } from "@utils/error";

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
      if (!vaultId || !backup) throw new CustomError("MISSING_REQUIRED_VALUE");

      let newMount = mount;
      if (!newMount) {
        const res = await vaultApi(vaultId).post<CoreMountItem>(
          "/api/v1/mounts",
          {
            root: backup?.rootID,
          },
        );

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
