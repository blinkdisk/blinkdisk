import { LOCAL_ACCOUNT_ID } from "@blinkdisk/constants/account";
import { useAppTranslation } from "@blinkdisk/hooks/use-app-translation";
import { Button } from "@blinkdisk/ui/button";
import { Logo } from "@components/logo";
import { useAuthDialog } from "@desktop/hooks/state/use-auth-dialog";
import { createFileRoute } from "@tanstack/react-router";

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
      <div className="flex flex-col items-center gap-2">
        <p className="text-muted-foreground text-lg font-semibold uppercase tracking-widest md:whitespace-nowrap">
          {t("title")}
        </p>
        <Logo className="mt-2 h-12" />
      </div>
      <p className="text-muted-foreground max-w-100 mt-8 text-base leading-7 md:text-lg">
        {t("description")}
      </p>

      <Button onClick={openAuthDialog} size="xl" className="mt-10 w-64">
        {t("signIn")}
      </Button>

      <button
        type="button"
        onClick={skipAuth}
        className="text-muted-foreground hover:text-foreground focus-visible:ring-3 focus-visible:ring-ring/50 mt-7 rounded-md px-3 py-2 text-sm outline-none transition-colors"
      >
        {t("skip")}
      </button>
    </div>
  );
}
