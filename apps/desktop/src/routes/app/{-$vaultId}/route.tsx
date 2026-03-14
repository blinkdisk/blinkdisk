import { TaskDialog } from "#components/dialogs/task";
import { Setup } from "#components/vaults/setup";
import { VaultStarting } from "#components/vaults/starting";
import { useVault } from "#hooks/queries/use-vault";
import { useVaultStatus } from "#hooks/queries/use-vault-status";
import { useAccountStorage } from "#hooks/use-account-storage";
import { useMigrationListener } from "#hooks/use-migration-listener";
import { createFileRoute, Outlet } from "@tanstack/react-router";
import { useEffect } from "react";

export const Route = createFileRoute("/app/{-$vaultId}")({
  component: RouteComponent,
});

function RouteComponent() {
  useMigrationListener();

  const { data: vault } = useVault();
  const { status } = useVaultStatus();

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
        <>
          <Setup />
        </>
      ) : (
        <Outlet />
      )}
    </>
  );
}
