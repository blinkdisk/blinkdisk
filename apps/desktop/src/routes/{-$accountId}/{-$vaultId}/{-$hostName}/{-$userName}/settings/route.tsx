import { createFileRoute, Outlet } from "@tanstack/react-router";

export const Route = createFileRoute(
  "/{-$accountId}/{-$vaultId}/{-$hostName}/{-$userName}/settings",
)({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <div className="flex min-h-full flex-col overflow-x-hidden p-6">
      <div className="mt-auto"></div>
      <div className="lg:w-130 mx-auto w-full">
        <Outlet />
      </div>
      <div className="mb-auto"></div>
    </div>
  );
}
