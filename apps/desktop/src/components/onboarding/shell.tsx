import { Logo } from "@blinkdisk/components/logo";
import { useAppTranslation } from "@blinkdisk/hooks/use-app-translation";
import { Button } from "@blinkdisk/ui/button";
import { cn } from "@blinkdisk/utils/class";
import { OnboardingPlan } from "@desktop/components/onboarding/plan";
import { OnboardingStepper } from "@desktop/components/onboarding/stepper";
import type { OnboardingStep } from "@desktop/lib/onboarding";
import { ArrowLeftIcon } from "lucide-react";
import type { ReactNode } from "react";

type OnboardingShellProps = {
  step: OnboardingStep | null;
  complete?: boolean;
  onBack?: () => void;
  onSkip?: () => void;
  children: ReactNode;
};

export function OnboardingShell({
  step,
  complete,
  onBack,
  onSkip,
  children,
}: OnboardingShellProps) {
  const { t } = useAppTranslation("onboarding.shell");

  return (
    <div className="bg-background text-foreground flex h-screen w-screen">
      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex h-20 shrink-0 items-center justify-between px-10">
          <Logo className="h-5" />
          {onSkip ? (
            <Button
              variant="ghost"
              size="sm"
              className="text-muted-foreground -mr-4"
              onClick={onSkip}
            >
              {t("skip")}
            </Button>
          ) : null}
        </header>
        <main className="flex-1 overflow-y-auto px-10 pb-10">
          <div className="mx-auto flex min-h-full w-full max-w-md flex-col justify-center">
            <div
              className={cn(
                "flex min-h-[35rem] flex-col",
                !step && "justify-center",
              )}
            >
              {step ? (
                <div className="mb-8 flex h-9 shrink-0 items-center gap-2">
                  {onBack ? (
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      className="text-muted-foreground -ml-2.5"
                      aria-label={t("back")}
                      onClick={onBack}
                    >
                      <ArrowLeftIcon />
                    </Button>
                  ) : null}
                  <OnboardingStepper step={step} complete={complete} />
                </div>
              ) : null}
              {children}
            </div>
          </div>
        </main>
      </div>
      <aside className="w-[44%] max-w-xl shrink-0 py-4 pr-4">
        <OnboardingPlan />
      </aside>
    </div>
  );
}
