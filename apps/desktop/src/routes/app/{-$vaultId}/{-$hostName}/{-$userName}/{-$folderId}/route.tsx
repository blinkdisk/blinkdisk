import { DeleteBackupDialog } from "@desktop/components/dialogs/delete-backup";
import { createFileRoute, Outlet } from "@tanstack/react-router";

export const Route = createFileRoute(
  "/app/{-$vaultId}/{-$hostName}/{-$userName}/{-$folderId}",
)({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <>
      <DeleteBackupDialog />
      <Outlet />
    </>
  );
}
