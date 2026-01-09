import { Layout } from "@desktop/components/layout";
import { useConfigCache } from "@desktop/hooks/use-config-cache";
import { useSubscriptionWatch } from "@desktop/hooks/use-subscription-watch";
import { useVaultCache } from "@desktop/hooks/use-vault-cache";
import { createFileRoute, Outlet } from "@tanstack/react-router";

export const Route = createFileRoute("/app")({
  component: RouteComponent,
});

function RouteComponent() {
  useVaultCache();
  useConfigCache();
  useSubscriptionWatch();

  return (
    <Layout>
      <Outlet />
    </Layout>
  );
}
