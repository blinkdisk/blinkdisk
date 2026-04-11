import { useAppTranslation } from "@blinkdisk/hooks/use-app-translation";
import { Button } from "@blinkdisk/ui/button";
import { Empty } from "@desktop/components/empty";
import { VaultHome } from "@desktop/components/vaults/home";
import { useSync } from "@desktop/hooks/mutations/use-sync";
import { useVaultList } from "@desktop/hooks/queries/use-vault-list";
import { useCreateVaultDialog } from "@desktop/hooks/state/use-create-vault-dialog";
import { useAccountId } from "@desktop/hooks/use-account-id";
import { createFileRoute } from "@tanstack/react-router";
import { CloudAlertIcon, PlusIcon, RefreshCwIcon } from "lucide-react";
import { useEffect } from "react";

export const Route = createFileRoute("/{-$accountId}/")({
  component: RouteComponent,
});

function RouteComponent() {
  const { t } = useAppTranslation("vault");
  const { accountId, isOnlineAccount } = useAccountId();
  const { openCreateVault } = useCreateVaultDialog();
  const { data: vaults } = useVaultList();

  const { mutate: sync, isPending: isSyncing } = useSync();

  const navigate = Route.useNavigate();

  useEffect(() => {
    if (!vaults?.length || !accountId) return;

    let lastUsedVaultId = window.electron.store.get(
      `accounts.${accountId}.lastUsedVaultId`,
    ) as string | null;

    if (lastUsedVaultId) {
      const vault = vaults.find((vault) => vault.id === lastUsedVaultId);
      if (!vault) lastUsedVaultId = null;
    }

    navigate({
      to: "/{-$accountId}/{-$vaultId}",
      params: (params) => ({
        ...params,
        vaultId: lastUsedVaultId || vaults[0]?.id || "",
      }),
      replace: true,
    });
  }, [accountId, vaults, navigate]);

  if (!vaults?.length)
    return (
      <Empty
        title={t("noVaults.title")}
        description={t("noVaults.description")}
        icon={<CloudAlertIcon />}
      >
        {isOnlineAccount ? (
          <Button
            loading={isSyncing}
            onClick={() => sync()}
            size="lg"
            variant="secondary"
            className="px-5"
          >
            <RefreshCwIcon />
            {t("noVaults.refresh")}
          </Button>
        ) : null}
        <Button onClick={openCreateVault} size="lg">
          <PlusIcon />
          {t("noVaults.add")}
        </Button>
      </Empty>
    );

  return <VaultHome />;
}
