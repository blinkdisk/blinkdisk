import { PinBadge } from "@desktop/components/backups/pin-badge";
import { useEditBackup } from "@desktop/hooks/mutations/core/use-edit-backup";
import { usePinBackupDialog } from "@desktop/hooks/state/use-pin-backup-dialog";
import { useAppTranslation } from "@hooks/use-app-translation";
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
import { InfoIcon, PlusIcon } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

export function PinBackupDialog() {
  const { t } = useAppTranslation("backup.pinDialog");
  const { isOpen, setIsOpen, options } = usePinBackupDialog();
  const [newPin, setNewPin] = useState("");

  const { mutateAsync, isPending } = useEditBackup({
    onSuccess: () => setIsOpen(false),
  });

  const [pins, setPins] = useState<string[]>([]);

  useEffect(() => {
    if (isOpen && options) {
      setPins(options.currentPins);
      setNewPin("");
    }
  }, [isOpen, options]);

  function handleOpen(open: boolean) {
    setIsOpen(open);
    if (!open) {
      setNewPin("");
    }
  }

  function addPin() {
    const trimmed = newPin.trim();
    if (!trimmed) return;
    if (pins.includes(trimmed)) {
      toast.error(t("duplicate"));
      return;
    }

    setPins((prev) => [...prev, trimmed]);
    setNewPin("");
  }

  function removePin(pin: string) {
    setPins((prev) => prev.filter((p) => p !== pin));
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
              variant="outline"
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
