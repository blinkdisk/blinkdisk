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
import { Loader } from "@blinkdisk/ui/loader";
import { useAuthDialog } from "@desktop/hooks/state/use-auth-dialog";
import { AlertCircleIcon, ClipboardPasteIcon } from "lucide-react";
import { useCallback, useState } from "react";

export function AuthDialog() {
  const { t } = useAppTranslation("auth.dialog");
  const { isOpen, browserFailed, setIsOpen, openAuthDialog } = useAuthDialog();

  const [loading, setLoading] = useState(false);
  const [codeError, setCodeError] = useState<
    "clipboardEmpty" | "invalidCode" | null
  >(null);
  const error = codeError ?? (browserFailed ? "browserFailed" : null);

  const reset = useCallback(() => {
    setCodeError(null);
  }, []);

  function reopen() {
    setCodeError(null);
    void openAuthDialog();
  }

  async function handlePasteCode() {
    setCodeError(null);
    setLoading(true);

    try {
      const text = await window.electron.clipboard.read();
      const token = text.trim();

      if (!token) {
        setCodeError("clipboardEmpty");
        setLoading(false);
        return;
      }

      await window.electron.auth.token({ token });
      setIsOpen(false);
      setLoading(false);
    } catch {
      setCodeError("invalidCode");
      setLoading(false);
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen} onClosed={reset}>
      <DialogContent className="w-105">
        <DialogHeader>
          <DialogTitle>{t("title")}</DialogTitle>
          <DialogDescription className="sr-only">
            {t("description")}
          </DialogDescription>
        </DialogHeader>

        {!browserFailed && (
          <div className="mt-8 flex gap-4">
            <Loader size={1.75} className="min-w-5" />
            <div className="space-y-1">
              <p className="text-base font-medium">{t("waiting.title")}</p>
              <p className="text-muted-foreground text-xs">
                {t("waiting.description")}
              </p>
            </div>
          </div>
        )}

        {error && (
          <Alert variant="destructive" className="mt-6">
            <AlertCircleIcon />
            <AlertTitle>{t(`error.${error}.title`)}</AlertTitle>
            <AlertDescription className="text-xs">
              {t(`error.${error}.description`)}
            </AlertDescription>
          </Alert>
        )}

        <DialogFooter className="mt-8">
          <Button onClick={reopen} variant="secondary">
            {t("reopen")}
          </Button>
          <Button onClick={handlePasteCode} loading={loading}>
            <ClipboardPasteIcon />
            {t("paste")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
