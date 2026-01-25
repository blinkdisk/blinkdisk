import { VaultHome } from "@desktop/components/vaults/home";
import { useLocalProfile } from "@desktop/hooks/use-local-profile";
import { createFileRoute } from "@tanstack/react-router";
import { useEffect } from "react";

export const Route = createFileRoute("/app/{-$vaultId}/")({
  component: RouteComponent,
});

function RouteComponent() {
  const { localHostName } = useLocalProfile();

  const navigate = Route.useNavigate();

  useEffect(() => {
    if (!localHostName) return;

    navigate({
      to: "/app/{-$vaultId}/{-$hostName}",
      params: (params) => ({
        ...params,
        hostName: localHostName,
      }),
      replace: true,
    });
  }, [navigate, localHostName]);

  return <VaultHome />;
}
