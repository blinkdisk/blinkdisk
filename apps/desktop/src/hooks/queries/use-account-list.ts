import { useQueryKey } from "@desktop/hooks/use-query-key";
import { authClient } from "@desktop/lib/auth";
import { useQuery } from "@tanstack/react-query";

export function useAccountList(options?: { enabled: boolean }) {
  const { queryKeys } = useQueryKey();

  return useQuery({
    queryKey: queryKeys.account.list(),
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
