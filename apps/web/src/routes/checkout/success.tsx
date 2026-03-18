import { APP_SCHEME } from "@blinkdisk/constants/app";
import { useAppTranslation } from "@blinkdisk/hooks/use-app-translation";
import { Button } from "@blinkdisk/ui/button";
import { createFileRoute } from "@tanstack/react-router";
import Confetti from "js-confetti";
import { CheckIcon } from "lucide-react";
import { useEffect } from "react";

export const Route = createFileRoute("/checkout/success")({
  component: RouteComponent,
});

function RouteComponent() {
  const { t } = useAppTranslation("subscription.checkoutSuccess");

  useEffect(() => {
    const confetti = new Confetti();
    confetti.addConfetti({ confettiNumber: 100 });
  }, []);

  return (
    <div className="py-30 flex min-h-screen w-screen flex-col items-center">
      <div className="mt-auto" />
      <div className="flex max-w-[90vw] flex-col items-center">
        <div className="flex size-14 items-center justify-center rounded-xl border border-lime-500/30 bg-lime-500/10 text-lime-600 dark:text-lime-500">
          <CheckIcon className="size-6" />
        </div>
        <h1 className="mt-10 text-center text-4xl font-bold">{t("title")}</h1>
        <p className="text-muted-foreground mt-4 max-w-sm text-center text-sm">
          {t("description")}
        </p>
        <Button
          className="mt-10"
          onClick={() => window.open(`${APP_SCHEME}://checkout_completed`)}
        >
          {t("openApp")}
        </Button>
      </div>
      <div className="mb-auto" />
    </div>
  );
}
