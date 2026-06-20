import { VaultConfigSettings } from "@desktop/components/vaults/settings/config";
import { useVault } from "@desktop/hooks/queries/use-vault";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";

export const Route = createFileRoute(
  "/{-$accountId}/{-$vaultId}/{-$hostName}/{-$userName}/settings/storage-config",
)({
  component: RouteComponent,
});

function RouteComponent() {
  const { data: vault } = useVault();
  const navigate = useNavigate();

  useEffect(() => {
    if (!vault || vault.provider !== "CLOUDBLINK") return;

    navigate({
      to: "/{-$accountId}/{-$vaultId}/{-$hostName}/{-$userName}/settings/general",
      replace: true,
    });
  }, [navigate, vault]);

  return <VaultConfigSettings />;
}
