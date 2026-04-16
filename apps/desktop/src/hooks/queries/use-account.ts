import { DEMO_ACCOUNT } from "@blinkdisk/constants/demo";
import { CustomError } from "@blinkdisk/utils/error";
import { useAccountId } from "@desktop/hooks/use-account-id";
import { isDemoMode } from "@desktop/lib/demo";
import { useQueryKey } from "@desktop/hooks/use-query-key";
import { useQuery } from "@tanstack/react-query";

export function useAccount(options?: { enabled: boolean }) {
  const { accountId, isOnlineAccount } = useAccountId();
  const { queryKeys } = useQueryKey();

  return useQuery({
    queryKey: queryKeys.account.detail(accountId),
    queryFn: async () => {
      if (isDemoMode) return DEMO_ACCOUNT;
      if (!accountId) throw new CustomError("MISSING_REQUIRED_VALUE");
      return await window.electron.auth.account.get(accountId);
    },
    enabled: isDemoMode || (!!isOnlineAccount && !!accountId && options?.enabled),
  });
}
