import { VaultHome } from "@desktop/components/vaults/home";
import { useVaultProfiles } from "@desktop/hooks/queries/core/use-vault-profiles";
import { useLocalProfile } from "@desktop/hooks/use-local-profile";
import { useProfile } from "@desktop/hooks/use-profile";
import { createFileRoute } from "@tanstack/react-router";
import { useEffect } from "react";

export const Route = createFileRoute(
  "/{-$accountId}/{-$vaultId}/{-$hostName}/",
)({
  component: RouteComponent,
});

function RouteComponent() {
  const { data: profiles } = useVaultProfiles();

  const { localUserName } = useLocalProfile();
  const { hostName } = useProfile();

  const navigate = Route.useNavigate();

  useEffect(() => {
    if (!profiles || !hostName || !localUserName) return;

    const profile = profiles.find((profile) => profile.hostName === hostName);

    if (!profile)
      navigate({
        to: "/{-$accountId}/{-$vaultId}",
        replace: true,
      });
    else {
      const localUser = profile.userNames.find(
        ({ userName }) => userName == localUserName,
      );

      navigate({
        to: "/{-$accountId}/{-$vaultId}/{-$hostName}/{-$userName}",
        params: (params) => ({
          ...params,
          userName: localUser
            ? localUserName
            : profile.userNames[0]?.userName || localUserName,
        }),
        replace: true,
      });
    }
  }, [profiles, navigate, localUserName, hostName]);

  return <VaultHome />;
}
