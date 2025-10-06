import { useAccountId } from "@desktop/hooks/use-account-id";
import { trpc } from "@desktop/lib/trpc";
import { useQuery } from "@tanstack/react-query";

export type ProfileItem = Awaited<
  ReturnType<typeof trpc.profile.list.query>
>[number];

export function useProfileList() {
  const { accountId } = useAccountId();

  return useQuery({
    queryKey: [accountId, "profile", "list"],
    queryFn: async () => {
      return trpc.profile.list.query({});
    },
    enabled: !!accountId,
  });
}
