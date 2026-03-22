import { Logo } from "@blinkdisk/components/logo";
import { useAppTranslation } from "@blinkdisk/hooks/use-app-translation";
import { Button } from "@blinkdisk/ui/button";
import { AuthDialog } from "@desktop/components/dialogs/auth";
import { useAuthDialog } from "@desktop/hooks/state/use-auth-dialog";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/auth")({
  component: RouteComponent,
});

function RouteComponent() {
  const { openAuthDialog } = useAuthDialog();
  const { t } = useAppTranslation("auth.welcome");

  return (
    <div className="flex h-screen w-screen flex-col items-center justify-center px-8">
      <div className="flex flex-col items-center">
        <Logo className="h-6" />

        <h1 className="mt-6 text-[2.5rem] font-bold tracking-tight">
          {t("title")}
        </h1>
        <p className="text-muted-foreground mt-2 max-w-md text-center text-base">
          {t("description")}
        </p>

        <Button onClick={() => openAuthDialog()} size="xl" className="mt-8">
          {t("button")}
        </Button>
      </div>

      <AuthDialog />
    </div>
  );
}
