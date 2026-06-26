import { CreateFolderDialog } from "@desktop/components/dialogs/create-folder";
import { DeleteFolderDialog } from "@desktop/components/dialogs/delete-folder";
import { DeleteVaultDialog } from "@desktop/components/dialogs/delete-vault";
import { EditExclusionDialog } from "@desktop/components/dialogs/edit-exclusion";
import { FolderDropzone } from "@desktop/components/folders/dropzone";
import { useSpaceUpdate } from "@desktop/hooks/use-space-update";
import { useTaskbarProgress } from "@desktop/hooks/use-taskbar-progress";
import { createFileRoute, Outlet } from "@tanstack/react-router";

export const Route = createFileRoute(
  "/{-$accountId}/{-$vaultId}/{-$hostName}/{-$userName}",
)({
  component: RouteComponent,
});

function RouteComponent() {
  useSpaceUpdate();

  useTaskbarProgress();

  return (
    <>
      <FolderDropzone />

      <CreateFolderDialog />
      <DeleteFolderDialog />
      <EditExclusionDialog />
      <DeleteVaultDialog />

      <Outlet />
    </>
  );
}
