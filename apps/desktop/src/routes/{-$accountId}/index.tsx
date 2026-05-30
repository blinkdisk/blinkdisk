import { useAppTranslation } from "@blinkdisk/hooks/use-app-translation";
import { Button } from "@blinkdisk/ui/button";
import { AccountHome } from "@desktop/components/accounts/home";
import { Empty } from "@desktop/components/empty";
import { useSync } from "@desktop/hooks/mutations/use-sync";
import { useVaultList } from "@desktop/hooks/queries/use-vault-list";
import { useCreateVaultDialog } from "@desktop/hooks/state/use-create-vault-dialog";
import { useAccountId } from "@desktop/hooks/use-account-id";
import { createFileRoute } from "@tanstack/react-router";
import { CloudAlertIcon, PlusIcon, RefreshCwIcon } from "lucide-react";
import { useCallback } from "react";

export const Route = createFileRoute("/{-$accountId}/")({
  component: RouteComponent,
});

function RouteComponent() {
  const { t } = useAppTranslation("vault");
  const { isOnlineAccount } = useAccountId();
  const { openCreateVault } = useCreateVaultDialog();
  const { data: vaults } = useVaultList();

  const { mutate: sync, isPending: isSyncing } = useSync();

  const openCreateCloudBlink = useCallback(() => {
    openCreateVault({
      step: "DETAILS",
      provider: "CLOUDBLINK",
      autoSelectedProvider: true,
    });
  }, [openCreateVault]);

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
        <Button
          onClick={() =>
            isOnlineAccount ? openCreateCloudBlink() : openCreateVault()
          }
          size="lg"
        >
          <PlusIcon />
          {t("noVaults.add")}
        </Button>
      </Empty>
    );

  return <AccountHome />;
}
