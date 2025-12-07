import { CreateFolderDialog } from "@desktop/components/dialogs/create-folder";
import { DeleteFolderDialog } from "@desktop/components/dialogs/delete-folder";
import { FolderSettingsDialog } from "@desktop/components/dialogs/folder-settings";
import { UpgradeDialog } from "@desktop/components/dialogs/upgrade";
import { FolderDropzone } from "@desktop/components/folders/dropzone";
import { ConfigMissing } from "@desktop/components/vaults/config-missing";
import { PasswordMissing } from "@desktop/components/vaults/password-missing";
import { useVault } from "@desktop/hooks/queries/use-vault";
import { useVaultStatus } from "@desktop/hooks/queries/use-vault-status";
import { useAccountStorage } from "@desktop/hooks/use-account-storage";
import { useProfile } from "@desktop/hooks/use-profile";
import { useSpaceUpdate } from "@desktop/hooks/use-space-update";
import { useVaultActivate } from "@desktop/hooks/use-vault-activate";
import { createFileRoute, Outlet } from "@tanstack/react-router";
import { useEffect } from "react";

export const Route = createFileRoute(
  "/app/{-$deviceId}/{-$profileId}/{-$vaultId}",
)({
  component: RouteComponent,
});

function RouteComponent() {
  useVaultActivate();
  useSpaceUpdate();

  const { data: vault } = useVault();
  const { data: status } = useVaultStatus();
  const { localProfileId } = useProfile();

  const [, setLastUsedVaultId] = useAccountStorage("lastUsedVaultId");

  useEffect(() => {
    if (!vault || vault.profileId !== localProfileId) return;
    setLastUsedVaultId(vault.id);
  }, [vault, setLastUsedVaultId, localProfileId]);

  if (vault && status === "PASSWORD_MISSING")
    return <PasswordMissing vault={vault} />;

  if (vault && status === "CONFIG_MISSING")
    return <ConfigMissing vault={vault} />;

  return (
    <>
      <UpgradeDialog />

      <FolderDropzone />

      <CreateFolderDialog />
      <DeleteFolderDialog />
      <FolderSettingsDialog />

      <Outlet />
    </>
  );
}
