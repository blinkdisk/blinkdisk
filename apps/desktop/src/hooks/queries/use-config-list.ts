import { useQueryKey } from "@desktop/hooks/use-query-key";
import { useProfile } from "@desktop/hooks/use-profile";
import { trpc } from "@desktop/lib/trpc";
import { useQuery } from "@tanstack/react-query";

export type ConfigListItem = Awaited<
  ReturnType<typeof trpc.config.list.query>
>[number];

export function useConfigList() {
  const { queryKeys, accountId } = useQueryKey();
  const { localProfileId } = useProfile();

  return useQuery({
    queryKey: queryKeys.config.list(localProfileId),
    queryFn: () => {
      if (!localProfileId) return [];
      return trpc.config.list.query({ profileId: localProfileId });
    },
    enabled: !!accountId && !!localProfileId,
  });
}
