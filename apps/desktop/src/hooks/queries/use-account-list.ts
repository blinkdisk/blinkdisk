import { authClient } from "@desktop/lib/auth";
import { useQuery } from "@tanstack/react-query";

export function useAccountList(options?: { enabled: boolean }) {
  return useQuery({
    queryKey: ["account", "list"],
    queryFn: async () => {
      const { data, error } =
        await authClient.multiSession.listDeviceSessions();
      if (error) throw error;

      return data.sort(
        (a, b) =>
          new Date(a.user.createdAt).getTime() -
          new Date(b.user.createdAt).getTime(),
      );
    },
    enabled: options?.enabled,
  });
}
