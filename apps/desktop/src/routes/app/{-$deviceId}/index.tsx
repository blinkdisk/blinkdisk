import { VaultHome } from "@desktop/components/vaults/home";
import { useProfile } from "@desktop/hooks/use-profile";
import { createFileRoute } from "@tanstack/react-router";
import { useEffect } from "react";

export const Route = createFileRoute("/app/{-$deviceId}/")({
  component: RouteComponent,
});

function RouteComponent() {
  const { localProfileId } = useProfile();

  const navigate = Route.useNavigate();

  useEffect(() => {
    navigate({
      to: "/app/{-$deviceId}/{-$profileId}",
      params: (params) => ({
        ...params,
        profileId: localProfileId || "-",
      }),
      replace: true,
    });
  }, [navigate, localProfileId]);

  return <VaultHome />;
}
