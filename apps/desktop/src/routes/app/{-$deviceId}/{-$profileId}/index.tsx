import { Empty } from "@desktop/components/empty";
import { VaultHome } from "@desktop/components/vaults/home";
import { MutatingButton } from "@desktop/components/vaults/mutating-button";
import { useProfileVaultList } from "@desktop/hooks/queries/use-profile-vault-list";
import { useAddVaultDialog } from "@desktop/hooks/state/use-add-vault-dialog";
import { useAccountId } from "@desktop/hooks/use-account-id";
import { useAppTranslation } from "@hooks/use-app-translation";
import { createFileRoute } from "@tanstack/react-router";
import { CloudAlertIcon, PlusIcon } from "lucide-react";
import { useEffect } from "react";

export const Route = createFileRoute("/app/{-$deviceId}/{-$profileId}/")({
  component: RouteComponent,
});

function RouteComponent() {
  const { t } = useAppTranslation("vault");
  const { accountId } = useAccountId();
  const { openAddVault } = useAddVaultDialog();
  const { data: vaults, isPending } = useProfileVaultList();

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
      to: "/app/{-$deviceId}/{-$profileId}/{-$vaultId}",
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
        <MutatingButton onClick={openAddVault} size="lg">
          <PlusIcon />
          {t("noVaults.button")}
        </MutatingButton>
      </Empty>
    );

  return <VaultHome />;
}
