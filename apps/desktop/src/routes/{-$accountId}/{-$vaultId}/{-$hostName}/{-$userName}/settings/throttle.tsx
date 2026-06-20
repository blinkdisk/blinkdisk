import { VaultThrottleSettings } from "@desktop/components/vaults/settings/throttle";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute(
  "/{-$accountId}/{-$vaultId}/{-$hostName}/{-$userName}/settings/throttle",
)({
  component: RouteComponent,
});

function RouteComponent() {
  return <VaultThrottleSettings />;
}
