import { useQueryKey } from "@desktop/hooks/use-query-key";
import { useQuery } from "@tanstack/react-query";

export function useAccountList(options?: { enabled: boolean }) {
  const { queryKeys } = useQueryKey();

  return useQuery({
    queryKey: queryKeys.account.list(),
    queryFn: async () => {
      const { data, error } = await window.electron.auth.session.list();
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
