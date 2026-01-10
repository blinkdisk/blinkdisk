import { Empty } from "@desktop/components/empty";
import { createFileRoute } from "@tanstack/react-router";
import { Loader } from "@ui/loader";

export const Route = createFileRoute("/app/migrate")({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <Empty
      icon={<Loader />}
      title="Updating vaults"
      description="We are updating your vaults to the latest version. This may take a few minutes."
    />
  );
}
