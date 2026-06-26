import { VaultGeneralSettings } from "@desktop/components/vaults/settings/general";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute(
  "/{-$accountId}/{-$vaultId}/{-$hostName}/{-$userName}/settings/general",
)({
  component: RouteComponent,
});

function RouteComponent() {
  return <VaultGeneralSettings />;
}
