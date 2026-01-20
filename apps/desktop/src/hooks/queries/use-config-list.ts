import { useProfile } from "@desktop/hooks/use-profile";
import { useQueryKey } from "@desktop/hooks/use-query-key";
import { trpc } from "@desktop/lib/trpc";
import { useQuery } from "@tanstack/react-query";

export function useConfigList() {
  const { queryKeys, accountId } = useQueryKey();
  const { localHostName, localUserName } = useProfile();

  return useQuery({
    queryKey: queryKeys.config.list(localHostName, localUserName),
    queryFn: () => {
      return trpc.config.list.query({
        hostName: localHostName,
        userName: localUserName,
      });
    },
    enabled: !!accountId,
  });
}
