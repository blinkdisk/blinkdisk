import { LOCAL_ACCOUNT_ID } from "@blinkdisk/constants/account";
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
import { Logo } from "@components/logo";
import { useAuthDialog } from "@desktop/hooks/state/use-auth-dialog";
import { createFileRoute } from "@tanstack/react-router";
import {
  BellIcon,
  CloudIcon,
  KeyRoundIcon,
  LogInIcon,
  SkipForwardIcon,
} from "lucide-react";
import { useState } from "react";

export const Route = createFileRoute("/welcome")({
  component: RouteComponent,
});

function RouteComponent() {
  const { t } = useAppTranslation("auth.welcome");
  const { openAuthDialog } = useAuthDialog();
  const navigate = Route.useNavigate();
  const [isSkipDialogOpen, setIsSkipDialogOpen] = useState(false);

  async function skipAuth() {
    await window.electron.store.set("currentAccountId", LOCAL_ACCOUNT_ID);

    navigate({
      to: "/{-$accountId}",
      params: { accountId: LOCAL_ACCOUNT_ID },
      replace: true,
    });
  }

  function signIn() {
    setIsSkipDialogOpen(false);
    openAuthDialog();
  }

  return (
    <div className="background-pattern text-foreground flex min-h-screen w-screen flex-col items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <div className="flex w-full items-center gap-4">
          <span className="to-border bg-linear-to-r h-px flex-1 from-transparent" />
          <p className="text-muted-foreground text-sm font-semibold uppercase tracking-[0.3em] md:whitespace-nowrap">
            {t("title")}
          </p>
          <span className="from-border bg-linear-to-r h-px flex-1 to-transparent" />
        </div>
        <Logo className="h-12" />
      </div>
      <p className="text-muted-foreground max-w-100 mt-8 text-center text-base leading-7 md:text-lg">
        {t("description")}
      </p>

      <Button onClick={signIn} size="xl" className="mt-12 px-14">
        <LogInIcon className="mr-3" />
        {t("signIn")}
      </Button>

      <Button
        onClick={() => setIsSkipDialogOpen(true)}
        size="sm"
        variant="ghost"
        className="text-muted-foreground absolute bottom-8"
      >
        <SkipForwardIcon />
        {t("skip")}
      </Button>

      <Dialog open={isSkipDialogOpen} onOpenChange={setIsSkipDialogOpen}>
        <DialogContent className="w-100">
          <DialogHeader>
            <DialogTitle>{t("skipDialog.title")}</DialogTitle>
            <DialogDescription className="sr-only">
              {t("skipDialog.description")}
            </DialogDescription>
          </DialogHeader>

          <div className="mb-8 mt-8 grid gap-4">
            <div className="flex gap-3">
              <CloudIcon className="text-destructive mt-0.5 size-4 shrink-0" />
              <div className="grid gap-1">
                <p className="text-sm font-medium">
                  {t("skipDialog.points.cloudblink.title")}
                </p>
                <p className="text-muted-foreground text-xs">
                  {t("skipDialog.points.cloudblink.description")}
                </p>
              </div>
            </div>
            <div className="flex gap-3">
              <KeyRoundIcon className="text-destructive mt-0.5 size-4 shrink-0" />
              <div className="grid gap-1">
                <p className="text-sm font-medium">
                  {t("skipDialog.points.sync.title")}
                </p>
                <p className="text-muted-foreground text-xs">
                  {t("skipDialog.points.sync.description")}
                </p>
              </div>
            </div>
            <div className="flex gap-3">
              <BellIcon className="text-destructive mt-0.5 size-4 shrink-0" />
              <div className="grid gap-1">
                <p className="text-sm font-medium">
                  {t("skipDialog.points.notifications.title")}
                </p>
                <p className="text-muted-foreground text-xs">
                  {t("skipDialog.points.notifications.description")}
                </p>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button
              onClick={() => setIsSkipDialogOpen(false)}
              variant="secondary"
            >
              {t("skipDialog.cancel")}
            </Button>
            <Button onClick={skipAuth} variant="destructive">
              {t("skipDialog.continue")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
