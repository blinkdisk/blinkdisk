import { useQueryKey } from "@desktop/hooks/use-query-key";
import { trpc } from "@desktop/lib/trpc";
import { useQuery } from "@tanstack/react-query";

export type ProfileItem = Awaited<
  ReturnType<typeof trpc.profile.list.query>
>[number];

export function useProfileList() {
  const { queryKeys, accountId } = useQueryKey();

  return useQuery({
    queryKey: queryKeys.profile.list(),
    queryFn: async () => {
      return trpc.profile.list.query({});
    },
    enabled: !!accountId,
  });
}
