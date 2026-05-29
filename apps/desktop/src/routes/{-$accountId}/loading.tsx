import { VaultOverview } from "@desktop/components/vaults/overview";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/{-$accountId}/loading")({
  component: RouteComponent,
});

// This page is used to show a loading state while
// the user is switching accounts, to prevent
// account-specific queries from throwing errors.
function RouteComponent() {
  return <VaultOverview />;
}
