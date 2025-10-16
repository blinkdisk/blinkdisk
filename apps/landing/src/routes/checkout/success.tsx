import { createFileRoute } from "@tanstack/react-router";
import { Button } from "@ui/button";
import Confetti from "js-confetti";
import { CheckIcon } from "lucide-react";
import { useEffect } from "react";

export const Route = createFileRoute("/checkout/success")({
  component: RouteComponent,
});

function RouteComponent() {
  useEffect(() => {
    const confetti = new Confetti();

    confetti.addConfetti({
      confettiNumber: 100,
    });
  }, []);

  return (
    <>
      <div className="flex min-h-screen flex-col items-center py-12">
        <div className="mt-auto"></div>
        <div className="flex max-w-[90vw] flex-col items-center">
          <div className="flex size-14 items-center justify-center rounded-xl border border-lime-500/30 bg-lime-500/10 text-lime-600 dark:text-lime-500 [&>svg]:size-6">
            <CheckIcon />
          </div>
          <h1 className="mt-10 text-center text-4xl font-bold">
            Subscribed successfully!
          </h1>
          <p className="text-muted-foreground mt-4 max-w-sm text-center text-sm">
            Your subscription has been successfully started. You can now close
            this window and return to your desktop app.
          </p>
          <Button
            onClick={() => window.open("blinkdisk://checkout_completed")}
            className="mt-10"
            size="lg"
          >
            Open Desktop App
          </Button>
        </div>
        <div className="mb-auto"></div>
      </div>
    </>
  );
}
