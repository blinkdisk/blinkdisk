import { VaultHome } from "@desktop/components/vaults/home";
import { useVaultProfiles } from "@desktop/hooks/queries/core/use-vault-profiles";
import { useProfile } from "@desktop/hooks/use-profile";
import { createFileRoute } from "@tanstack/react-router";
import { useEffect } from "react";

export const Route = createFileRoute("/app/{-$vaultId}/{-$hostName}/")({
  component: RouteComponent,
});

function RouteComponent() {
  const { data: profiles } = useVaultProfiles();
  const { hostName, localUserName } = useProfile();

  const navigate = Route.useNavigate();

  useEffect(() => {
    if (!profiles || !hostName) return;

    const profile = profiles.find((profile) => profile.hostName === hostName);

    if (!profile)
      navigate({
        to: "/app/{-$vaultId}",
        replace: true,
      });
    else {
      const localUser = profile.userNames.find(
        ({ userName }) => userName == localUserName,
      );

      navigate({
        to: "/app/{-$vaultId}/{-$hostName}/{-$userName}",
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
