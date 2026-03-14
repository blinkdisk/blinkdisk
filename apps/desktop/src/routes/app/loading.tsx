import { VaultHome } from "@desktop/components/vaults/home";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/app/loading")({
  component: RouteComponent,
});

// This page is used to show a loading state while
// the user is switching accounts, to prevent
// account-specific queries from throwing errors.
function RouteComponent() {
  return <VaultHome />;
}
