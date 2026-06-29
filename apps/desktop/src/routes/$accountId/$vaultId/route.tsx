import { CreateSourceDialog } from "@desktop/components/dialogs/create-source";
import { DeleteSourceDialog } from "@desktop/components/dialogs/delete-source";
import { DeleteVaultDialog } from "@desktop/components/dialogs/delete-vault";
import { EditExclusionDialog } from "@desktop/components/dialogs/edit-exclusion";
import { TaskDialog } from "@desktop/components/dialogs/task";
import { SourceDropzone } from "@desktop/components/sources/dropzone";
import { Setup } from "@desktop/components/vaults/setup";
import { VaultStarting } from "@desktop/components/vaults/starting";
import { useVault } from "@desktop/hooks/queries/use-vault";
import { useVaultStatus } from "@desktop/hooks/queries/use-vault-status";
import { useAccountStorage } from "@desktop/hooks/use-account-storage";
import { useSpaceUpdate } from "@desktop/hooks/use-space-update";
import { useTaskbarProgress } from "@desktop/hooks/use-taskbar-progress";
import { createFileRoute, Outlet } from "@tanstack/react-router";
import { useEffect } from "react";
import { z } from "zod";

export const Route = createFileRoute("/$accountId/$vaultId")({
  component: RouteComponent,
  validateSearch: z.object({
    otherHostName: z.string().optional(),
    otherUserName: z.string().optional(),
  }),
});

function RouteComponent() {
  const { data: vault } = useVault();
  const { status } = useVaultStatus();

  useSpaceUpdate();

  useTaskbarProgress();

  const [, setLastUsedVaultId] = useAccountStorage("lastUsedVaultId");

  useEffect(() => {
    if (!vault) return;
    setLastUsedVaultId(vault.id);
  }, [vault, setLastUsedVaultId]);

  return (
    <>
      <TaskDialog />

      {status === "STARTING" ? (
        <VaultStarting />
      ) : vault && status === "SETUP" ? (
        <Setup />
      ) : (
        <>
          <SourceDropzone />

          <CreateSourceDialog />
          <DeleteSourceDialog />
          <EditExclusionDialog />
          <DeleteVaultDialog />

          <Outlet />
        </>
      )}
    </>
  );
}
