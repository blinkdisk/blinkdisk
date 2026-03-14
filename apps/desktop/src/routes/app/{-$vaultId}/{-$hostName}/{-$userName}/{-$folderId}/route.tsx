import { DeleteBackupDialog } from "#components/dialogs/delete-backup";
import { PinBackupDialog } from "#components/dialogs/pin-backup";
import { RenameBackupDialog } from "#components/dialogs/rename-backup";
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
      <PinBackupDialog />
      <RenameBackupDialog />
      <Outlet />
    </>
  );
}
