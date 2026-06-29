import { DeleteBackupDialog } from "@desktop/components/dialogs/delete-backup";
import { PinBackupDialog } from "@desktop/components/dialogs/pin-backup";
import { RenameBackupDialog } from "@desktop/components/dialogs/rename-backup";
import { parseSourceId } from "@desktop/lib/source";
import { createFileRoute, notFound, Outlet } from "@tanstack/react-router";

const reservedVaultPageIds = new Set(["policies", "settings"]);

export const Route = createFileRoute("/$accountId/$vaultId/$sourceId")({
  beforeLoad: ({ params }) => {
    if (reservedVaultPageIds.has(params.sourceId)) throw notFound();
    if (!parseSourceId(params.sourceId)) throw notFound();
  },
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
