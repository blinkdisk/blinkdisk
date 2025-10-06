import { VaultHome } from "@desktop/components/vaults/home";
import { useVault } from "@desktop/hooks/queries/use-vault";
import { useVaultStatus } from "@desktop/hooks/queries/use-vault-status";
import { useFolderList } from "@desktop/hooks/use-folder-list";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/app/{-$deviceId}/{-$profileId}/{-$vaultId}/")({
  component: RouteComponent,
});

function RouteComponent() {
  const { data: vault } = useVault();
  const { data: status } = useVaultStatus();
  const { data: folders } = useFolderList();

  return (
    <VaultHome
      vault={status === "RUNNING" ? vault : undefined}
      folders={status === "RUNNING" && folders !== null ? folders : undefined}
    />
  );
}
