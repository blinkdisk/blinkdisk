import { useDeleteVault } from "@desktop/hooks/mutations/use-delete-vault";
import { useVault } from "@desktop/hooks/queries/use-vault";
import { useDeleteVaultDialog } from "@desktop/hooks/state/use-delete-vault-dialog";
import { useAppTranslation } from "@hooks/use-app-translation";
import { useNavigate } from "@tanstack/react-router";
import { Alert, AlertDescription, AlertTitle } from "@ui/alert";
import { Button } from "@ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@ui/dialog";
import { InfoIcon } from "lucide-react";

export function DeleteVaultDialog() {
  const navigate = useNavigate();

  const { t } = useAppTranslation("vault.deleteDialog");

  const { isOpen, setIsOpen, options } = useDeleteVaultDialog();

  const { data: vault } = useVault(options?.vaultId);

  const { mutateAsync, isPending } = useDeleteVault({
    onSuccess: async () => {
      setIsOpen(false);

      await navigate({
        to: "/app/{-$deviceId}/{-$profileId}",
      });
    },
  });

  return (
    <>
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="w-105">
          <DialogHeader>
            <DialogTitle>{t("title")}</DialogTitle>
            <DialogDescription>{t("description")}</DialogDescription>
          </DialogHeader>
          {vault && vault.provider !== "BLINKDISK_CLOUD" ? (
            <Alert className="mt-4 w-full">
              <InfoIcon />
              <AlertTitle>{t("storageAlert.title")}</AlertTitle>
              <AlertDescription className="text-xs">
                {t("storageAlert.description")}
              </AlertDescription>
            </Alert>
          ) : null}
          {/*
            TODO: Implement deleting linked vaults
            <Alert className="mt-4 w-full">
              <InfoIcon />
              <AlertTitle>{t("linkedAlert.title")}</AlertTitle>
              <AlertDescription className="text-xs">
                {t("linkedAlert.description")}
              </AlertDescription>
            </Alert>
          */}
          <DialogFooter className="mt-6">
            <Button onClick={() => setIsOpen(false)} variant="outline">
              {t("cancel")}
            </Button>
            <Button
              loading={isPending}
              onClick={() =>
                options && mutateAsync({ vaultId: options.vaultId })
              }
              variant="destructive"
            >
              {t("continue")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
