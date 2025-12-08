import { useQueryKey } from "@desktop/hooks/use-query-key";
import { useQuery } from "@tanstack/react-query";

export function useDirectoryEmpty(directoryPath: string | undefined) {
  const { queryKeys } = useQueryKey();

  return useQuery({
    queryKey: queryKeys.directory.empty(directoryPath),
    queryFn: async () => {
      if (!directoryPath) return false;

      return await window.electron.vault.restore.checkEmpty({
        directoryPath,
      });
    },
    enabled: !!directoryPath,
  });
}
