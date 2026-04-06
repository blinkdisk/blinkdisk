import { useAccountId } from "@desktop/hooks/use-account-id";
import { useQueryKey } from "@desktop/hooks/use-query-key";
import { useQuery } from "@tanstack/react-query";

export function useAccount(options?: { enabled: boolean }) {
  const { isOnlineAccount } = useAccountId();
  const { queryKeys } = useQueryKey();

  return useQuery({
    queryKey: queryKeys.account.detail(),
    queryFn: async () => {
      const { data, error } = await window.electron.auth.session.get();

      if (error) throw error;
      return data;
    },
    enabled: !!isOnlineAccount && options?.enabled,
  });
}
