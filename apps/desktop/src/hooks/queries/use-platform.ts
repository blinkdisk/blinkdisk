import { useQuery } from "@tanstack/react-query";

export function usePlatform() {
  return useQuery({
    queryKey: ["platform"],
    queryFn: async () => {
      const platform = await window.electron.os.platform();

      if (platform === "win32") return "windows";
      if (platform === "darwin") return "macos";
      if (platform === "linux") return "linux";

      return platform as "aix" | "freebsd" | "openbsd" | "sunos" | "android";
    },
  });
}
