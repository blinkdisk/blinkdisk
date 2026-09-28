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
import { isAuthorizationCode } from "@desktop/components/dialogs/auth/code";
import { useAccountList } from "@desktop/hooks/queries/use-account-list";
import { useAuthDialog } from "@desktop/hooks/state/use-auth-dialog";
import { AlertCircleIcon, ClipboardPasteIcon } from "lucide-react";
import { usePostHog } from "posthog-js/react";
import { useCallback, useEffect, useRef, useState } from "react";

type AuthError =
  | "clipboardEmpty"
  | "invalidClipboard"
  | "invalidCode"
  | "networkError"
  | "unexpectedError";

export function AuthDialog() {
  const { t } = useAppTranslation("auth.dialog");
  const { isOpen, setIsOpen } = useAuthDialog();
  const { accounts } = useAccountList();
  const posthog = usePostHog();
  const previousAccountIds = useRef(
    new Set(accounts.map((account) => account.id)),
  );

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<AuthError | null>(null);

  useEffect(() => {
    if (
      isOpen &&
      accounts.some((account) => !previousAccountIds.current.has(account.id))
    )
      setIsOpen(false);

    previousAccountIds.current = new Set(accounts.map((account) => account.id));
  }, [accounts, isOpen, setIsOpen]);

  const reset = useCallback(() => {
    setError(null);
  }, []);

  async function reopen() {
    await window.electron.auth.open();
  }

  async function handlePasteCode() {
    setError(null);
    setLoading(true);

    let reason: AuthError | null = null;
    let failure: unknown;

    try {
      const text = await window.electron.clipboard.read();
      const token = text.trim();

      if (!token) {
        reason = "clipboardEmpty";
        failure = new Error("Clipboard is empty");
      } else if (!isAuthorizationCode(token)) {
        reason = "invalidClipboard";
        failure = new Error("Clipboard does not contain an authorization code");
      } else {
        const result = await window.electron.auth.token({ token });
        if (result.ok) setIsOpen(false);
        else {
          reason = result.reason;
          failure = new Error(`Desktop sign-in failed: ${reason}`);
        }
      }
    } catch (error) {
      failure = error;
      reason = "unexpectedError";
    } finally {
      setLoading(false);
    }

    if (reason) {
      setError(reason);
      posthog.capture("desktop_login_failed", { reason, method: "paste" });
      posthog.captureException(failure, { reason, method: "paste" });
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

        <div className="mt-8 flex gap-4">
          <Loader size={1.75} className="min-w-5" />
          <div className="space-y-1">
            <p className="text-base font-medium">{t("waiting.title")}</p>
            <p className="text-muted-foreground text-xs">
              {t("waiting.description")}
            </p>
          </div>
        </div>

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
          <Button onClick={() => reopen()} variant="secondary">
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
