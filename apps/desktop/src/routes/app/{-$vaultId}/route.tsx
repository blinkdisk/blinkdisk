import { ConfigMissing } from "@desktop/components/vaults/config-missing";
import { PasswordMissing } from "@desktop/components/vaults/password-missing";
import { useVault } from "@desktop/hooks/queries/use-vault";
import { useVaultStatus } from "@desktop/hooks/queries/use-vault-status";
import { useAccountStorage } from "@desktop/hooks/use-account-storage";
import { useMigrationListener } from "@desktop/hooks/use-migration-listener";
import { createFileRoute, Outlet } from "@tanstack/react-router";
import { useEffect } from "react";

export const Route = createFileRoute("/app/{-$vaultId}")({
  component: RouteComponent,
});

function RouteComponent() {
  useMigrationListener();

  const { data: vault } = useVault();
  const { data: status } = useVaultStatus();

  const [, setLastUsedVaultId] = useAccountStorage("lastUsedVaultId");

  useEffect(() => {
    if (!vault) return;
    setLastUsedVaultId(vault.id);
  }, [vault, setLastUsedVaultId]);

  if (vault && status === "PASSWORD_MISSING")
    return <PasswordMissing vault={vault} />;

  if (vault && status === "CONFIG_MISSING")
    return <ConfigMissing vault={vault} />;

  return (
    <>
      <Outlet />
    </>
  );
}
