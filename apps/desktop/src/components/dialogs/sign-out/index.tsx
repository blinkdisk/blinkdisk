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
import { useSignOutDialog } from "@desktop/hooks/state/use-sign-out-dialog";
import { useAuth } from "@desktop/hooks/use-auth";
import { TriangleAlertIcon } from "lucide-react";
import { useState } from "react";

export function SignOutDialog() {
  const { t } = useAppTranslation("settings.account.signOut.dialog");
  const { isOpen, setIsOpen } = useSignOutDialog();
  const { logout } = useAuth();
  const [isSigningOut, setIsSigningOut] = useState(false);

  const handleSignOut = async () => {
    setIsSigningOut(true);

    try {
      await logout();
    } finally {
      setIsSigningOut(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="w-95">
        <DialogHeader>
          <DialogTitle>{t("title")}</DialogTitle>
          <DialogDescription className="sr-only">
            {t("description")}
          </DialogDescription>
        </DialogHeader>
        <Alert variant="warn" className="mt-6">
          <TriangleAlertIcon />
          <AlertTitle>{t("warning.title")}</AlertTitle>
          <AlertDescription className="text-xs">
            {t("warning.description")}
          </AlertDescription>
        </Alert>
        <DialogFooter className="mt-6">
          <Button
            type="button"
            variant="secondary"
            onClick={() => setIsOpen(false)}
          >
            {t("cancel")}
          </Button>
          <Button
            type="button"
            variant="destructive"
            loading={isSigningOut}
            onClick={handleSignOut}
          >
            {t("confirm")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
