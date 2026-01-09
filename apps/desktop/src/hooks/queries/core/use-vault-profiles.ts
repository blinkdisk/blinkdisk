import { useProfile } from "@desktop/hooks/use-profile";
import { useQueryKey } from "@desktop/hooks/use-query-key";
import { useVaultId } from "@desktop/hooks/use-vault-id";
import { vaultApi } from "@desktop/lib/vault";
import { useQuery } from "@tanstack/react-query";

type Profile = {
  hostName: string;
  mock?: boolean;
  userNames: {
    userName: string;
    mock?: boolean;
  }[];
};

export function useVaultProfiles() {
  const { localHostName, localUserName } = useProfile();
  const { queryKeys, accountId } = useQueryKey();
  const { vaultId } = useVaultId();

  return useQuery({
    queryKey: queryKeys.vault.profiles(vaultId),
    queryFn: async () => {
      if (!vaultId) return null;

      const res = await vaultApi(vaultId).get<{
        policies: {
          target: {
            host: string;
            userName: string;
            path: string;
          };
        }[];
      }>("/api/v1/policies");

      if (!res.data) return null;

      const profiles: Profile[] = [];

      for (const policy of res.data.policies) {
        if (!policy.target.host || !policy.target.userName) continue;

        const index = profiles.findIndex(
          (profile) => profile.hostName === policy.target.host,
        );

        if (index !== -1) {
          if (
            profiles[index]?.userNames.find(
              ({ userName }) => userName === policy.target.userName,
            )
          )
            continue;
          profiles[index]?.userNames.push({ userName: policy.target.userName });
        } else {
          profiles.push({
            hostName: policy.target.host,
            userNames: [
              {
                userName: policy.target.userName,
              },
            ],
          });
        }
      }

      const localProfileIndex = profiles.findIndex(
        (profile) => profile.hostName === localHostName,
      );

      if (localProfileIndex === -1)
        profiles.push({
          hostName: localHostName,
          mock: true,
          userNames: [
            {
              userName: localUserName,
              mock: true,
            },
          ],
        });
      else {
        if (
          !profiles[localProfileIndex]?.userNames.find(
            ({ userName }) => userName === localUserName,
          )
        )
          profiles[localProfileIndex]?.userNames.push({
            userName: localUserName,
            mock: true,
          });
      }

      return profiles;
    },
    enabled: !!accountId && !!vaultId,
  });
}
