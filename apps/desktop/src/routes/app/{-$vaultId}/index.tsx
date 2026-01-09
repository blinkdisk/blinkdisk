import { VaultHome } from "@desktop/components/vaults/home";
import { useProfile } from "@desktop/hooks/use-profile";
import { createFileRoute } from "@tanstack/react-router";
import { useEffect } from "react";

export const Route = createFileRoute("/app/{-$vaultId}/")({
  component: RouteComponent,
});

function RouteComponent() {
  const { localHostName } = useProfile();

  const navigate = Route.useNavigate();

  useEffect(() => {
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
