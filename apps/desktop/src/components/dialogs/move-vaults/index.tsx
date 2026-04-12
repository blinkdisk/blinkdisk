import { LOCAL_ACCOUNT_ID } from "@blinkdisk/constants/account";
import { useAppTranslation } from "@blinkdisk/hooks/use-app-translation";
import { Button } from "@blinkdisk/ui/button";
import { Checkbox } from "@blinkdisk/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@blinkdisk/ui/dialog";
import { AccountPreview } from "@desktop/components/accounts/preview";
import { VaultPreview } from "@desktop/components/vaults/preview";
import { useMoveVaults } from "@desktop/hooks/mutations/use-move-vaults";
import { useAccountList } from "@desktop/hooks/queries/use-account-list";
import { useMoveVaultsDialog } from "@desktop/hooks/state/use-move-vaults-dialog";
import { useSelectAccountDialog } from "@desktop/hooks/state/use-select-account-dialog";
import { useReactivity } from "@desktop/hooks/use-reactivity";
import { getVaultCollection } from "@desktop/lib/db";
import { useNavigate } from "@tanstack/react-router";
import { ArrowUpDownIcon } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";

export function MoveVaultsDialog() {
  const navigate = useNavigate();

  const { t } = useAppTranslation("vault.moveDialog");
  const { isOpen, setIsOpen, options } = useMoveVaultsDialog();
  const { openSelectAccountDialog } = useSelectAccountDialog();
  const { accounts } = useAccountList();

  const [selectedVaultIds, setSelectedVaultIds] = useState<Set<string>>(
    new Set(),
  );
  const [toAccountId, setToAccountId] = useState<string | null>(null);

  const { mutate, isPending } = useMoveVaults({
    onSuccess: async (values) => {
      await navigate({
        to: "/{-$accountId}/{-$vaultId}",
        params: {
          accountId: values.toAccountId,
          vaultId: values.vaultIds.at(-1),
        },
      });

      setIsOpen(false);
    },
  });

  const localVaults = useReactivity(
    () =>
      getVaultCollection(LOCAL_ACCOUNT_ID).find({ status: "ACTIVE" }).fetch(),
    [],
  );

  const toAccount = useMemo(
    () => accounts.find((a) => a.id === toAccountId),
    [accounts, toAccountId],
  );

  const reset = useCallback(() => {
    setSelectedVaultIds(new Set());
    setToAccountId(null);
  }, []);

  useEffect(() => {
    if (isOpen && options) {
      if (options.allVaults)
        setSelectedVaultIds(new Set(localVaults.map((vault) => vault.id)));
      else setSelectedVaultIds(new Set(options.vaultIds || []));

      setToAccountId(options.toAccountId || null);
    }
  }, [options, isOpen, localVaults]);

  const toggleVault = useCallback((vaultId: string, checked: boolean) => {
    setSelectedVaultIds((prev) => {
      const next = new Set(prev);
      if (checked) {
        next.add(vaultId);
      } else {
        next.delete(vaultId);
      }
      return next;
    });
  }, []);

  const handleSelectAccount = useCallback(() => {
    openSelectAccountDialog({
      onSelect: (accountId) => setToAccountId(accountId),
    });
  }, [openSelectAccountDialog]);

  const canSubmit = selectedVaultIds.size > 0 && !!toAccountId;

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen} onClosed={reset}>
      <DialogContent className="w-100">
        <DialogHeader>
          <DialogTitle>{t("title")}</DialogTitle>
          <DialogDescription className="sr-only">
            {t("description")}
          </DialogDescription>
        </DialogHeader>
        <div className="mt-6 flex flex-col gap-6">
          <div>
            <p className="text-muted-foreground mb-2 text-xs font-medium">
              {t("from")}
            </p>
            <div className="flex items-center gap-2">
              <div className="flex-1">
                <AccountPreview local />
              </div>
              <Button variant="secondary" size="sm" disabled>
                {t("changeAccount")}
              </Button>
            </div>
          </div>
          <div>
            <p className="text-muted-foreground mb-2 text-xs font-medium">
              {t("vaults")}
            </p>
            <div className="flex flex-col gap-3">
              {localVaults?.map((vault) => (
                <label
                  key={vault.id}
                  htmlFor={`vault-${vault.id}`}
                  className="flex items-center gap-3"
                >
                  <Checkbox
                    id={`vault-${vault.id}`}
                    checked={selectedVaultIds.has(vault.id)}
                    onCheckedChange={(checked) =>
                      toggleVault(vault.id, !!checked)
                    }
                    className="size-4.5"
                  />
                  <VaultPreview vault={vault} />
                </label>
              ))}
            </div>
          </div>
          <div>
            <p className="text-muted-foreground mb-2 text-xs font-medium">
              {t("to")}
            </p>
            {toAccount ? (
              <div className="flex items-center gap-2">
                <div className="flex-1">
                  <AccountPreview account={toAccount} />
                </div>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={handleSelectAccount}
                >
                  {t("changeAccount")}
                </Button>
              </div>
            ) : (
              <Button
                variant="secondary"
                className="w-full"
                onClick={handleSelectAccount}
              >
                {t("selectAccount")}
              </Button>
            )}
          </div>
        </div>
        <DialogFooter className="mt-6">
          <Button
            className="w-full"
            disabled={!canSubmit}
            onClick={() =>
              toAccountId &&
              mutate({ vaultIds: Array.from(selectedVaultIds), toAccountId })
            }
            loading={isPending}
          >
            <ArrowUpDownIcon />
            {t("submit")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
