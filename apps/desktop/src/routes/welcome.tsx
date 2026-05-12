import { LOCAL_ACCOUNT_ID } from "@blinkdisk/constants/account";
import { useAppTranslation } from "@blinkdisk/hooks/use-app-translation";
import { Button } from "@blinkdisk/ui/button";
import { Logo } from "@components/logo";
import { useAuthDialog } from "@desktop/hooks/state/use-auth-dialog";
import { createFileRoute } from "@tanstack/react-router";
import { LogInIcon, SkipForwardIcon } from "lucide-react";

export const Route = createFileRoute("/welcome")({
  component: RouteComponent,
});

function RouteComponent() {
  const { t } = useAppTranslation("auth.welcome");
  const { openAuthDialog } = useAuthDialog();
  const navigate = Route.useNavigate();

  async function skipAuth() {
    await window.electron.store.set("currentAccountId", LOCAL_ACCOUNT_ID);

    navigate({
      to: "/{-$accountId}",
      params: { accountId: LOCAL_ACCOUNT_ID },
      replace: true,
    });
  }

  return (
    <div className="background-pattern text-foreground flex min-h-screen w-screen flex-col items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <div className="flex w-full items-center gap-4">
          <span className="to-border h-px flex-1 bg-gradient-to-r from-transparent" />
          <p className="text-muted-foreground text-sm font-semibold uppercase tracking-[0.3em] md:whitespace-nowrap">
            {t("title")}
          </p>
          <span className="from-border h-px flex-1 bg-gradient-to-r to-transparent" />
        </div>
        <Logo className="h-12" />
      </div>
      <p className="text-muted-foreground max-w-100 mt-8 text-base leading-7 md:text-lg">
        {t("description")}
      </p>

      <div className="mt-10 flex gap-4">
        <Button onClick={skipAuth} size="icon-xl" variant="secondary">
          <SkipForwardIcon />
          <span className="sr-only">{t("skip")}</span>
        </Button>
        <Button onClick={openAuthDialog} size="xl" className="px-14">
          <LogInIcon className="mr-3" />
          {t("signIn")}
        </Button>
      </div>
    </div>
  );
}
