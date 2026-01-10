import { RestoreDirectoryDialog } from "@desktop/components/dialogs/restore-directory";
import { createFileRoute, Outlet } from "@tanstack/react-router";

export const Route = createFileRoute(
  "/app/{-$vaultId}/{-$hostName}/{-$userName}/{-$folderId}/{-$backupId}/{-$directoryId}",
)({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <>
      <RestoreDirectoryDialog />
      <Outlet />
    </>
  );
}
