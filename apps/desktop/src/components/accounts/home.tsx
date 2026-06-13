import { useAppTranslation } from "@blinkdisk/hooks/use-app-translation";
import { Button } from "@blinkdisk/ui/button";
import { cn } from "@blinkdisk/utils/class";
import { useSync } from "@desktop/hooks/mutations/use-sync";
import { useSpace } from "@desktop/hooks/queries/use-space";
import { useVaultList } from "@desktop/hooks/queries/use-vault-list";
import { useCreateVaultDialog } from "@desktop/hooks/state/use-create-vault-dialog";
import { useAccountId } from "@desktop/hooks/use-account-id";
import { PlusIcon, RefreshCwIcon } from "lucide-react";
import { useCallback } from "react";
import { VaultCard } from "../vaults/card";
import { HealthCard } from "./health-card";
import { StorageCard } from "./storage-card";

export function AccountHome() {
  const { t } = useAppTranslation("vault.home");
  const { isOnlineAccount } = useAccountId();
  const { openCreateVault } = useCreateVaultDialog();
  const { mutate: sync, isPending: isSyncing } = useSync();
  const { data: vaults } = useVaultList();
  const { data: space } = useSpace();

  const openCreateCloudBlink = useCallback(() => {
    openCreateVault({
      step: "DETAILS",
      provider: "CLOUDBLINK",
      autoSelectedProvider: true,
    });
  }, [openCreateVault]);

  return (
    <div className="flex min-h-full flex-col overflow-y-auto p-6">
      <div className="mb-8 flex flex-row gap-6">
        <HealthCard isLoading={vaults === undefined} vaults={vaults} />
        {isOnlineAccount && space !== null ? (
          <StorageCard isLoading={vaults === undefined} />
        ) : null}
      </div>
      <div className="mb-6 flex h-9 w-full items-center justify-between gap-4">
        <div className="flex flex-col">
          <h1 className="text-xl font-semibold">{t("title")}</h1>
          <p className="text-xs text-muted-foreground">
            {t("count", { count: vaults?.length ?? 0 })}
          </p>
        </div>
        <div className="flex gap-3">
          {isOnlineAccount && (
            <Button
              variant="secondary"
              size="icon"
              onClick={() => sync()}
              disabled={isSyncing}
            >
              <RefreshCwIcon
                className={cn("size-4", isSyncing && "animate-spin")}
              />
            </Button>
          )}
          <Button
            onClick={() =>
              isOnlineAccount ? openCreateCloudBlink() : openCreateVault()
            }
          >
            <PlusIcon />
            {t("createVault")}
          </Button>
        </div>
      </div>
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2 2xl:grid-cols-3 3xl:grid-cols-4">
        {vaults?.map((vault) => (
          <VaultCard key={vault.id} vault={vault} />
        ))}
      </div>
    </div>
  );
}
