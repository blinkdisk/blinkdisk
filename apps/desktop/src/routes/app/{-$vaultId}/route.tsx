import { ConfigMissing } from "@desktop/components/vaults/config-missing";
import { PasswordMissing } from "@desktop/components/vaults/password-missing";
import { useVault } from "@desktop/hooks/queries/use-vault";
import { useVaultStatus } from "@desktop/hooks/queries/use-vault-status";
import { useAccountStorage } from "@desktop/hooks/use-account-storage";
import { useMigrationListener } from "@desktop/hooks/use-migration-listener";
import { useVaultId } from "@desktop/hooks/use-vault-id";
import { createFileRoute, Outlet } from "@tanstack/react-router";
import { useEffect } from "react";

export const Route = createFileRoute("/app/{-$vaultId}")({
  component: RouteComponent,
});

function RouteComponent() {
  useMigrationListener();

  const { vaultId } = useVaultId();

  const { data: vault } = useVault();
  const { data: status } = useVaultStatus();

  const [, setLastUsedVaultId] = useAccountStorage("lastUsedVaultId");

  useEffect(() => {
    if (!vault) return;
    setLastUsedVaultId(vault.id);
  }, [vault, setLastUsedVaultId]);

  if (
    vaultId &&
    (status === "PASSWORD_MISSING" || status === "PASSWORD_INVALID")
  )
    return <PasswordMissing vaultId={vaultId} status={status} />;

  if (vault && status === "CONFIG_MISSING")
    return <ConfigMissing vault={vault} />;

  return (
    <>
      <Outlet />
    </>
  );
}
