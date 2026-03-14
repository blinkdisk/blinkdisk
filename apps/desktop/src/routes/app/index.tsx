import { Empty } from "#components/empty";
import { VaultHome } from "#components/vaults/home";
import { useVaultList } from "#hooks/queries/use-vault-list";
import { useCreateVaultDialog } from "#hooks/state/use-create-vault-dialog";
import { useAccountId } from "#hooks/use-account-id";
import { useAppTranslation } from "@blinkdisk/hooks/use-app-translation";
import { createFileRoute } from "@tanstack/react-router";
import { Button } from "@blinkdisk/ui/button";
import { CloudAlertIcon, PlusIcon } from "lucide-react";
import { useEffect } from "react";

export const Route = createFileRoute("/app/")({
  component: RouteComponent,
});

function RouteComponent() {
  const { t } = useAppTranslation("vault");
  const { accountId } = useAccountId();
  const { openCreateVault } = useCreateVaultDialog();
  const { data: vaults, isPending } = useVaultList();

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
      to: "/app/{-$vaultId}",
      params: (params) => ({
        ...params,
        vaultId: lastUsedVaultId || vaults[0]?.id || "",
      }),
      replace: true,
    });
  }, [accountId, vaults, navigate]);

  if (!isPending && !vaults?.length)
    return (
      <Empty
        title={t("noVaults.title")}
        description={t("noVaults.description")}
        icon={<CloudAlertIcon />}
      >
        <Button onClick={openCreateVault} size="lg">
          <PlusIcon />
          {t("noVaults.button")}
        </Button>
      </Empty>
    );

  return <VaultHome />;
}
