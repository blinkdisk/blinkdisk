import { CustomError } from "@blinkdisk/utils/error";
import { useAccountId } from "@desktop/hooks/use-account-id";
import { useQueryKey } from "@desktop/hooks/use-query-key";
import { useQuery } from "@tanstack/react-query";

export function useAccount(options?: { enabled: boolean }) {
  const { accountId, isOnlineAccount } = useAccountId();
  const { queryKeys } = useQueryKey();

  return useQuery({
    queryKey: queryKeys.account.detail(accountId),
    queryFn: async () => {
      if (!accountId) throw new CustomError("MISSING_REQUIRED_VALUE");
      return await window.electron.auth.account.get(accountId);
    },
    enabled: !!isOnlineAccount && !!accountId && options?.enabled,
  });
}
