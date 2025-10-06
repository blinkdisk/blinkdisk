import { useAccountId } from "@desktop/hooks/use-account-id";
import { useProfile } from "@desktop/hooks/use-profile";
import { trpc } from "@desktop/lib/trpc";
import { useQuery } from "@tanstack/react-query";

export type ProfileVaultListItem = Awaited<
  ReturnType<typeof trpc.vault.list.query>
>[number];

export function useProfileVaultList() {
  const { accountId } = useAccountId();
  const { profileId } = useProfile();

  return useQuery({
    queryKey: [accountId, "vault", "list", profileId],
    queryFn: () => {
      return trpc.vault.list.query({
        profileId: profileId!,
      });
    },
    enabled: !!accountId && !!profileId,
  });
}
