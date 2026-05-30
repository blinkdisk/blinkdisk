import { VaultOverview } from "@desktop/components/vaults/overview";
import { useLocalProfile } from "@desktop/hooks/use-local-profile";
import { createFileRoute } from "@tanstack/react-router";
import { useEffect } from "react";

export const Route = createFileRoute("/{-$accountId}/{-$vaultId}/")({
  component: RouteComponent,
});

function RouteComponent() {
  const { localHostName } = useLocalProfile();

  const navigate = Route.useNavigate();

  useEffect(() => {
    if (!localHostName) return;

    navigate({
      to: "/{-$accountId}/{-$vaultId}/{-$hostName}",
      params: (params) => ({
        ...params,
        hostName: localHostName,
      }),
      replace: true,
    });
  }, [navigate, localHostName]);

  return <VaultOverview />;
}
