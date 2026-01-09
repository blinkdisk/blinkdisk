import { CreateFolderDialog } from "@desktop/components/dialogs/create-folder";
import { DeleteFolderDialog } from "@desktop/components/dialogs/delete-folder";
import { DeleteVaultDialog } from "@desktop/components/dialogs/delete-vault";
import { EditExclusionDialog } from "@desktop/components/dialogs/delete/edit-exclusion";
import { FolderSettingsDialog } from "@desktop/components/dialogs/folder-settings";
import { UpgradeDialog } from "@desktop/components/dialogs/upgrade";
import { FolderDropzone } from "@desktop/components/folders/dropzone";
import { useSpaceUpdate } from "@desktop/hooks/use-space-update";
import { createFileRoute, Outlet } from "@tanstack/react-router";

export const Route = createFileRoute(
  "/app/{-$vaultId}/{-$hostName}/{-$userName}",
)({
  component: RouteComponent,
});

function RouteComponent() {
  useSpaceUpdate();

  return (
    <>
      <UpgradeDialog />

      <FolderDropzone />

      <CreateFolderDialog />
      <DeleteFolderDialog />
      <FolderSettingsDialog />
      <EditExclusionDialog />
      <DeleteVaultDialog />

      <Outlet />
    </>
  );
}
