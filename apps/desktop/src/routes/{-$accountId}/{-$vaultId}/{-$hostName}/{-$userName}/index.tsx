import { VaultOverview } from "@desktop/components/vaults/overview";
import { useFolderList } from "@desktop/hooks/queries/core/use-folder-list";
import { useVault } from "@desktop/hooks/queries/use-vault";
import { useVaultStatus } from "@desktop/hooks/queries/use-vault-status";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute(
  "/{-$accountId}/{-$vaultId}/{-$hostName}/{-$userName}/",
)({
  component: RouteComponent,
});

function RouteComponent() {
  const { data: vault } = useVault();
  const { status } = useVaultStatus();
  const { data: folders } = useFolderList();

  return (
    <VaultOverview
      vault={status === "RUNNING" ? vault : undefined}
      folders={status === "RUNNING" && folders !== null ? folders : undefined}
    />
  );
}
