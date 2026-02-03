import { useEffect } from "react";
import Confetti from "js-confetti";
import { CheckIcon } from "lucide-react";

export default function CheckoutSuccessClient() {
  useEffect(() => {
    const confetti = new Confetti();

    confetti.addConfetti({
      confettiNumber: 100,
    });
  }, []);

  return (
    <div className="py-30 flex min-h-screen flex-col items-center">
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
        <button
          onClick={() => window.open("blinkdisk://checkout_completed")}
          className="bg-primary text-primary-foreground hover:bg-primary/90 mt-10 inline-flex h-10 items-center justify-center rounded-md px-6 text-sm font-medium transition-colors"
        >
          Open Desktop App
        </button>
      </div>
      <div className="mb-auto"></div>
    </div>
  );
}
