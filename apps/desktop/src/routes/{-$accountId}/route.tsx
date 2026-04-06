import { Layout } from "@desktop/components/layout";
import { useSubscriptionWatch } from "@desktop/hooks/use-subscription-watch";
import { createFileRoute, Outlet } from "@tanstack/react-router";

export const Route = createFileRoute("/{-$accountId}")({
  component: RouteComponent,
});

function RouteComponent() {
  useSubscriptionWatch();

  return (
    <Layout>
      <Outlet />
    </Layout>
  );
}
