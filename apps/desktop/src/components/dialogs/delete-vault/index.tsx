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
import { Input } from "@ui/input";
import { LabelContainer } from "@ui/label";
import { InfoIcon } from "lucide-react";
import { useCallback, useState } from "react";

export function DeleteVaultDialog() {
  const navigate = useNavigate();

  const { t } = useAppTranslation("vault.deleteDialog");

  const { isOpen, setIsOpen, options } = useDeleteVaultDialog();

  const { data: vault } = useVault(options?.vaultId);

  const [confirmName, setConfirmName] = useState("");
  const [showError, setShowError] = useState(false);

  const isConfirmed = vault
    ? confirmName.replace(/\s/g, "").toLowerCase() === vault.name.replace(/\s/g, "").toLowerCase()
    : false;

  const reset = useCallback(async () => {
    setConfirmName("");
    setShowError(false);
  }, []);

  const onSuccess = useCallback(async () => {
    setIsOpen(false);

    await navigate({
      to: "/app",
    });
  }, [navigate, setIsOpen]);

  const { mutate: mutateDelete, isPending: isDeletePending } = useDeleteVault({
    onSuccess,
  });

  return (
    <>
      <Dialog open={isOpen} onOpenChange={setIsOpen} onClosed={reset}>
        <DialogContent className="w-105">
          <DialogHeader>
            <DialogTitle>{t("title")}</DialogTitle>
            <DialogDescription>{t("description")}</DialogDescription>
          </DialogHeader>
          {vault && vault.provider !== "CLOUDBLINK" ? (
            <Alert className="mt-4 w-full">
              <InfoIcon />
              <AlertTitle>{t("storageAlert.title")}</AlertTitle>
              <AlertDescription className="text-xs">
                {t("storageAlert.description")}
              </AlertDescription>
            </Alert>
          ) : null}
          {vault && (
            <LabelContainer
              containerClassName="mt-4"
              name="confirm"
              title={t("confirm.label", { vaultName: vault.name })}
              errors={
                showError
                  ? [
                      {
                        message: confirmName.length === 0
                          ? t("confirm.error.empty", { vaultName: vault.name })
                          : t("confirm.error.mismatch"),
                        translated: true,
                      },
                    ]
                  : undefined
              }
            >
              <Input
                id="confirm"
                type="text"
                value={confirmName}
                onChange={(e) => {
                  setShowError(false);
                  setConfirmName(e.target.value)
                }}
                placeholder={t("confirm.placeholder")}
              />
            </LabelContainer>
          )}
          <DialogFooter className="mt-6">
            <Button onClick={() => setIsOpen(false)} variant="outline">
              {t("cancel")}
            </Button>
            <Button
              loading={isDeletePending}
              onClick={() => {
                if (!isConfirmed)
                  return setShowError(true);
                if (options) mutateDelete({ vaultId: options.vaultId });
              }}
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
