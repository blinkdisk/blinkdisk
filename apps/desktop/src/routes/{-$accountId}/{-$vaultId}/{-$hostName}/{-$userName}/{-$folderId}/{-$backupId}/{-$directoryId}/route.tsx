import { RestoreDirectoryDialog } from "@desktop/components/dialogs/restore-directory";
import { createFileRoute, Outlet } from "@tanstack/react-router";

export const Route = createFileRoute(
  "/{-$accountId}/{-$vaultId}/{-$hostName}/{-$userName}/{-$folderId}/{-$backupId}/{-$directoryId}",
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
