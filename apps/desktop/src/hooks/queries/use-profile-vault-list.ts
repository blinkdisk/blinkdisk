import { useProfile } from "@desktop/hooks/use-profile";
import { useQueryKey } from "@desktop/hooks/use-query-key";
import { trpc } from "@desktop/lib/trpc";
import { useQuery } from "@tanstack/react-query";

export type ProfileVaultListItem = Awaited<
  ReturnType<typeof trpc.vault.list.query>
>[number];

export function useProfileVaultList() {
  const { queryKeys, accountId } = useQueryKey();
  const { profileId } = useProfile();

  return useQuery({
    queryKey: queryKeys.vault.listByProfile(profileId),
    queryFn: () => {
      return trpc.vault.list.query({
        profileId: profileId!,
      });
    },
    enabled: !!accountId && !!profileId,
  });
}
