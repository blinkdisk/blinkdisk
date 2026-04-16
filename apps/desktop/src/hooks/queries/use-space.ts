import { DEMO_SPACE } from "@blinkdisk/constants/demo";
import { useAccountId } from "@desktop/hooks/use-account-id";
import { isDemoMode } from "@desktop/lib/demo";
import { useQueryKey } from "@desktop/hooks/use-query-key";
import { trpc } from "@desktop/lib/trpc";
import { useQuery } from "@tanstack/react-query";

export function useSpace() {
  const { isOnlineAccount } = useAccountId();
  const { queryKeys } = useQueryKey();

  return useQuery({
    queryKey: queryKeys.space,
    queryFn: () => {
      if (isDemoMode) return DEMO_SPACE;
      return trpc.cloudblink.space.query();
    },
    refetchOnMount: false,
    enabled: isDemoMode || !!isOnlineAccount,
  });
}
