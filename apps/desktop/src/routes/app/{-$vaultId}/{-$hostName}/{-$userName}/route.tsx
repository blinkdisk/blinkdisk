import { CreateFolderDialog } from "#components/dialogs/create-folder";
import { DeleteFolderDialog } from "#components/dialogs/delete-folder";
import { DeleteVaultDialog } from "#components/dialogs/delete-vault";
import { EditExclusionDialog } from "#components/dialogs/delete/edit-exclusion";
import { FolderSettingsDialog } from "#components/dialogs/folder-settings";
import { UpgradeDialog } from "#components/dialogs/upgrade";
import { FolderDropzone } from "#components/folders/dropzone";
import { useVaultPolicy } from "#hooks/queries/core/use-vault-policy";
import { useSpaceUpdate } from "#hooks/use-space-update";
import { useTaskbarProgress } from "#hooks/use-taskbar-progress";
import { createFileRoute, Outlet } from "@tanstack/react-router";

export const Route = createFileRoute(
  "/app/{-$vaultId}/{-$hostName}/{-$userName}",
)({
  component: RouteComponent,
});

function RouteComponent() {
  useSpaceUpdate();

  // This will create the vault policy
  // in case it doesn't exist yet
  useVaultPolicy();
  useTaskbarProgress();

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
