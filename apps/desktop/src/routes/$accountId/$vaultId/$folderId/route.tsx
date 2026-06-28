import { DeleteBackupDialog } from "@desktop/components/dialogs/delete-backup";
import { PinBackupDialog } from "@desktop/components/dialogs/pin-backup";
import { RenameBackupDialog } from "@desktop/components/dialogs/rename-backup";
import { parseFolderId } from "@desktop/lib/folder";
import { createFileRoute, notFound, Outlet } from "@tanstack/react-router";

const reservedVaultPageIds = new Set(["policies", "settings"]);

export const Route = createFileRoute(
  "/$accountId/$vaultId/$folderId",
)({
  beforeLoad: ({ params }) => {
    if (reservedVaultPageIds.has(params.folderId)) throw notFound();
    if (!parseFolderId(params.folderId)) throw notFound();
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
