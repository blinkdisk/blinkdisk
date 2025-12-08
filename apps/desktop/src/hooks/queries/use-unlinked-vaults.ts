import { useQueryKey } from "@desktop/hooks/use-query-key";
import { useProfile } from "@desktop/hooks/use-profile";
import { trpc } from "@desktop/lib/trpc";
import { useQuery } from "@tanstack/react-query";

export type UnlinkedVaultItem = Awaited<
  ReturnType<typeof trpc.vault.listUnlinked.query>
>[number];

export function useUnlinkedVaults() {
  const { queryKeys, accountId } = useQueryKey();
  const { profileId } = useProfile();

  return useQuery({
    queryKey: queryKeys.vault.unlinked(profileId),
    queryFn: () => {
      return trpc.vault.listUnlinked.query({
        profileId: profileId!,
      });
    },
    enabled: !!accountId && !!profileId,
  });
}
