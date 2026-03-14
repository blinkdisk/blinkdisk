import { Layout } from "#components/layout";
import { useSubscriptionWatch } from "#hooks/use-subscription-watch";
import { useVaultCache } from "#hooks/use-vault-cache";
import { createFileRoute, Outlet } from "@tanstack/react-router";

export const Route = createFileRoute("/app")({
  component: RouteComponent,
});

function RouteComponent() {
  useVaultCache();
  useSubscriptionWatch();

  return (
    <Layout>
      <Outlet />
    </Layout>
  );
}
