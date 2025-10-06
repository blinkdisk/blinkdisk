import { useAccountId } from "@desktop/hooks/use-account-id";
import { useProfile } from "@desktop/hooks/use-profile";
import { trpc } from "@desktop/lib/trpc";
import { useQuery } from "@tanstack/react-query";

export type ConfigListItem = Awaited<
  ReturnType<typeof trpc.config.list.query>
>[number];

export function useConfigList() {
  const { accountId } = useAccountId();
  const { localProfileId } = useProfile();

  return useQuery({
    queryKey: [accountId, "config", "list", localProfileId],
    queryFn: () => {
      if (!localProfileId) return [];
      return trpc.config.list.query({ profileId: localProfileId });
    },
    enabled: !!accountId && !!localProfileId,
  });
}
