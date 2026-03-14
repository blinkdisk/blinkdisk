import { VaultHome } from "#components/vaults/home";
import { useFolderList } from "#hooks/queries/core/use-folder-list";
import { useVault } from "#hooks/queries/use-vault";
import { useVaultStatus } from "#hooks/queries/use-vault-status";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute(
  "/app/{-$vaultId}/{-$hostName}/{-$userName}/",
)({
  component: RouteComponent,
});

function RouteComponent() {
  const { data: vault } = useVault();
  const { status } = useVaultStatus();
  const { data: folders } = useFolderList();

  return (
    <VaultHome
      vault={status === "RUNNING" ? vault : undefined}
      folders={status === "RUNNING" && folders !== null ? folders : undefined}
    />
  );
}
