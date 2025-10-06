import { useQuery } from "@tanstack/react-query";

export function useDirectoryEmpty(directoryPath: string | undefined) {
  return useQuery({
    queryKey: ["directory", "empty", directoryPath],
    queryFn: async () => {
      if (!directoryPath) return false;

      return await window.electron.vault.restore.checkEmpty({
        directoryPath,
      });
    },
    enabled: !!directoryPath,
  });
}
