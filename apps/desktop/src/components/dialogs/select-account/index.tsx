import { useAppTranslation } from "@blinkdisk/hooks/use-app-translation";
import { Button } from "@blinkdisk/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@blinkdisk/ui/dialog";
import { Field, FieldLabel } from "@blinkdisk/ui/field";
import { RadioGroup, RadioGroupItem } from "@blinkdisk/ui/radio-group";
import { AccountPreview } from "@desktop/components/accounts/preview";
import { useAccountList } from "@desktop/hooks/queries/use-account-list";
import { useSelectAccountDialog } from "@desktop/hooks/state/use-select-account-dialog";
import { LOCAL_ACCOUNT_ID } from "libs/constants/src/account";
import { useCallback, useState } from "react";

export function SelectAccountDialog() {
  const { t } = useAppTranslation("auth.account.selectDialog");

  const { isOpen, setIsOpen, options } = useSelectAccountDialog();
  const { accounts } = useAccountList();

  const [accountId, setAccountId] = useState<string>("");

  const reset = useCallback(() => {
    setAccountId("");
  }, []);

  const handleSelect = useCallback(() => {
    if (!accountId || !options?.onSelect) return;
    options.onSelect(accountId);
    setIsOpen(false);
  }, [accountId, options, setIsOpen]);

  const allAccounts = [
    ...(options?.showLocal
      ? [{ id: LOCAL_ACCOUNT_ID, local: true as const }]
      : []),
    ...accounts.map((account) => ({
      id: account.id,
      local: false as const,
      account,
    })),
  ];

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen} onClosed={reset}>
      <DialogContent className="w-95">
        <DialogHeader>
          <DialogTitle>{t("title")}</DialogTitle>
          <DialogDescription className="sr-only">
            {t("description")}
          </DialogDescription>
        </DialogHeader>
        <RadioGroup
          className="mt-6"
          value={accountId}
          onValueChange={setAccountId}
        >
          {allAccounts.map((entry) => (
            <FieldLabel key={entry.id} htmlFor={`account-${entry.id}`}>
              <Field orientation="horizontal" className="items-center">
                <div className="flex-1">
                  <AccountPreview
                    account={entry.local ? undefined : entry.account}
                    local={entry.local}
                  />
                </div>
                <RadioGroupItem value={entry.id} id={`account-${entry.id}`} />
              </Field>
            </FieldLabel>
          ))}
        </RadioGroup>
        <DialogFooter className="mt-6">
          <Button
            className="w-full"
            onClick={handleSelect}
            disabled={!accountId}
          >
            {t("select")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
