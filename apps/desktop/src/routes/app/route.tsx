import { Layout } from "@desktop/components/layout";
import { useSubscriptionWatch } from "@desktop/hooks/use-subscription-watch";
import { useVaultCache } from "@desktop/hooks/use-vault-cache";
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
