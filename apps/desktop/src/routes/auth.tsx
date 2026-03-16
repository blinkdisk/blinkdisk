import { Button } from "@blinkdisk/ui/button";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/auth")({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <div className="flex h-screen w-screen flex-col items-center justify-center">
      <Button onClick={() => window.electron.auth.open()} size="xl">
        Register
      </Button>
    </div>
  );
}
