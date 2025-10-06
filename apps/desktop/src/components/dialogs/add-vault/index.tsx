import { AddVaultSource } from "@desktop/components/dialogs/add-vault/source";
import { CreateVaultDialogContent } from "@desktop/components/dialogs/create-vault/content";
import { LinkVaultDialogContent } from "@desktop/components/dialogs/link-vault/content";
import { useUnlinkedVaults } from "@desktop/hooks/queries/use-unlinked-vaults";
import { useAddVaultDialog } from "@desktop/hooks/state/use-add-vault-dialog";
import { useAppTranslation } from "@hooks/use-app-translation";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@ui/dialog";
import { Loader } from "@ui/loader";
import { useCallback, useState } from "react";

type AddVaultSourceType = "LINK" | "CREATE";

export function AddVaultDialog() {
  const { t } = useAppTranslation("vault.addDialog");
  const { isOpen, setIsOpen } = useAddVaultDialog();

  const { data: unlinkedVaults, isLoading } = useUnlinkedVaults();

  const [action, setAction] = useState<AddVaultSourceType | null>();

  const reset = useCallback(() => {
    setAction(null);
  }, [setAction]);

  const onBack = useCallback(() => {
    setAction(null);
  }, [setAction]);

  const close = useCallback(() => {
    setIsOpen(false);
  }, [setIsOpen]);

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen} onClosed={reset}>
      <DialogContent className="w-120 block max-h-[80vh] overflow-y-auto">
        {!isLoading && (!unlinkedVaults?.length || action === "CREATE") ? (
          <CreateVaultDialogContent
            onBack={onBack}
            canGoBack={!!unlinkedVaults?.length}
            onSubmit={close}
          />
        ) : !isLoading && action === "LINK" ? (
          <LinkVaultDialogContent
            onBack={() => setAction(undefined)}
            onSubmit={close}
          />
        ) : (
          <>
            <div className="flex items-center gap-3">
              <DialogTitle>{t("title")}</DialogTitle>
            </div>
            <DialogDescription className="sr-only">
              {t("description")}
            </DialogDescription>
            {isLoading ? (
              <div className="flex h-48 items-center justify-center">
                <Loader />
              </div>
            ) : (
              <AddVaultSource
                create={() => setAction("CREATE")}
                link={() => setAction("LINK")}
              />
            )}
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
