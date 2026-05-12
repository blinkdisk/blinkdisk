import { Icon } from "@blinkdisk/components/icon";
import { LOCAL_ACCOUNT_ID } from "@blinkdisk/constants/account";
import { useAppTranslation } from "@blinkdisk/hooks/use-app-translation";
import { Button } from "@blinkdisk/ui/button";
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
    <div className="bg-background background-pattern text-foreground flex min-h-screen w-screen items-center justify-center overflow-hidden px-6">
      <main className="flex w-full max-w-3xl flex-col items-center text-center">
        <div className="border-border bg-card shadow-foreground/10 dark:shadow-foreground/5 relative mb-12 flex size-24 items-center justify-center overflow-hidden rounded-[1.75rem] border shadow-2xl">
          <div className="bg-linear-to-tl dark:bg-linear-to-br absolute inset-0 from-transparent dark:to-white/5"></div>
          <Icon className="size-13 drop-shadow-red-500 drop-shadow-xl" />
        </div>

        <h1 className="text-[2.5rem] font-bold leading-tight tracking-normal md:whitespace-nowrap">
          {t("title")}
        </h1>
        <p className="text-muted-foreground mt-4 max-w-md text-base leading-7 md:text-lg">
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
      </main>
    </div>
  );
}
