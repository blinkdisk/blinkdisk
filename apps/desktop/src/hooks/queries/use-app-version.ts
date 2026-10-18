import { useQuery } from "@tanstack/react-query";

export function useAppVersion() {
  return useQuery({
    queryKey: ["app", "version"],
    queryFn: () => window.electron.app.version(),
    staleTime: Infinity,
  });
}
