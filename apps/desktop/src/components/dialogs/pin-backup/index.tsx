import { useAppTranslation } from "@blinkdisk/hooks/use-app-translation";
import { Alert, AlertDescription, AlertTitle } from "@blinkdisk/ui/alert";
import { Button } from "@blinkdisk/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@blinkdisk/ui/dialog";
import { Input } from "@blinkdisk/ui/input";
import { PinBadge } from "@desktop/components/backups/pin-badge";
import { useEditBackup } from "@desktop/hooks/mutations/core/use-edit-backup";
import { usePinBackupDialog } from "@desktop/hooks/state/use-pin-backup-dialog";
import { InfoIcon, PlusIcon } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

type PinDialogState<T> = {
  key: string;
  value: T;
};

export function PinBackupDialog() {
  const { t } = useAppTranslation("backup.pinDialog");
  const { isOpen, setIsOpen, options } = usePinBackupDialog();
  const optionsKey = options?.backupId ?? "closed";
  const initialPins = options?.currentPins ?? [];
  const [newPinState, setNewPinState] = useState<PinDialogState<string> | null>(
    null,
  );
  const [pinsState, setPinsState] = useState<PinDialogState<string[]> | null>(
    null,
  );
  const newPin = newPinState?.key === optionsKey ? newPinState.value : "";
  const pins = pinsState?.key === optionsKey ? pinsState.value : initialPins;

  const { mutateAsync, isPending } = useEditBackup({
    onSuccess: () => setIsOpen(false),
  });

  function handleOpen(open: boolean) {
    setIsOpen(open);
    if (!open) {
      setNewPinState(null);
      setPinsState(null);
    }
  }

  function setNewPin(value: string) {
    setNewPinState({ key: optionsKey, value });
  }

  function updatePins(updater: (pins: string[]) => string[]) {
    setPinsState((current) => ({
      key: optionsKey,
      value: updater(current?.key === optionsKey ? current.value : initialPins),
    }));
  }

  function addPin() {
    const trimmed = newPin.trim();
    if (!trimmed) return;
    if (pins.includes(trimmed)) {
      toast.error(t("duplicate"));
      return;
    }

    updatePins((prev) => [...prev, trimmed]);
    setNewPin("");
  }

  function removePin(pin: string) {
    updatePins((prev) => prev.filter((p) => p !== pin));
  }

  async function save() {
    if (!options) return;

    const currentPins = options.currentPins;
    const addPins = pins.filter((p) => !currentPins.includes(p));
    const removePins = currentPins.filter((p) => !pins.includes(p));

    if (addPins.length === 0 && removePins.length === 0) {
      setIsOpen(false);
      return;
    }

    await mutateAsync({
      backupId: options.backupId,
      addPins: addPins.length > 0 ? addPins : undefined,
      removePins: removePins.length > 0 ? removePins : undefined,
    });
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleOpen}>
      <DialogContent className="w-105">
        <DialogHeader>
          <DialogTitle>{t("title")}</DialogTitle>
          <DialogDescription className="sr-only">
            {t("description")}
          </DialogDescription>
        </DialogHeader>
        <Alert variant="info" className="mt-4">
          <InfoIcon />
          <AlertTitle>{t("alert.title")}</AlertTitle>
          <AlertDescription className="text-xs">
            {t("alert.description")}
          </AlertDescription>
        </Alert>
        <div className="mt-4 flex flex-col gap-4">
          <div className="flex gap-2">
            <Input
              value={newPin}
              onChange={(e) => setNewPin(e.target.value)}
              placeholder={t("placeholder")}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  addPin();
                }
              }}
            />
            <Button
              type="button"
              variant="secondary"
              onClick={addPin}
              disabled={!newPin.trim()}
            >
              <PlusIcon />
              {t("add")}
            </Button>
          </div>
          {pins.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {pins.map((pin) => (
                <PinBadge key={pin} pin={pin} onRemove={() => removePin(pin)} />
              ))}
            </div>
          )}
        </div>
        <DialogFooter className="mt-6">
          <Button className="w-full" onClick={save} loading={isPending}>
            {t("save")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
