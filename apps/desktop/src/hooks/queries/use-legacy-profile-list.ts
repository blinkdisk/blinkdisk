import { useQueryKey } from "@desktop/hooks/use-query-key";
import { trpc } from "@desktop/lib/trpc";
import { useQuery } from "@tanstack/react-query";

export type LegacyProfileItem = Awaited<
  ReturnType<typeof trpc.profile.listLegacy.query>
>[number];

export function useLegacyProfileList() {
  const { queryKeys, accountId } = useQueryKey();

  return useQuery({
    queryKey: queryKeys.profile.listLegacy(),
    queryFn: async () => {
      return trpc.profile.listLegacy.query();
    },
    enabled: !!accountId,
  });
}
