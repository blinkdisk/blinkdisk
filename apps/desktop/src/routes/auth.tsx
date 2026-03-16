import { Button } from "@blinkdisk/ui/button";
import { AuthDialog } from "@desktop/components/dialogs/auth";
import { useAuthDialog } from "@desktop/hooks/state/use-auth-dialog";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/auth")({
  component: RouteComponent,
});

function RouteComponent() {
  const { openAuthDialog } = useAuthDialog();

  return (
    <div className="flex h-screen w-screen flex-col items-center justify-center">
      <Button onClick={() => openAuthDialog()} size="xl">
        Register
      </Button>
      <AuthDialog />
    </div>
  );
}
