import { useAppTranslation } from "@blinkdisk/hooks/use-app-translation";
import { cn } from "@blinkdisk/utils/class";
import { ONBOARDING_STEPS, type OnboardingStep } from "@desktop/lib/onboarding";

type OnboardingStepperProps = {
  step: OnboardingStep;
  complete?: boolean;
};

export function OnboardingStepper({ step, complete }: OnboardingStepperProps) {
  const { t } = useAppTranslation("onboarding.shell");
  const current = ONBOARDING_STEPS.indexOf(step);

  return (
    <div className="flex items-center gap-3">
      <p className="text-muted-foreground text-xs font-medium tabular-nums">
        {t("step", { current: current + 1, total: ONBOARDING_STEPS.length })}
      </p>
      <ol className="flex items-center gap-1.5">
        {ONBOARDING_STEPS.map((id, index) => (
          <li
            key={id}
            title={t(`steps.${id}`)}
            aria-current={index === current ? "step" : undefined}
            className="bg-foreground/10 h-1.5 w-7 overflow-hidden rounded-full"
          >
            <span className="sr-only">{t(`steps.${id}`)}</span>
            <span
              className={cn(
                "bg-primary block h-full rounded-full transition-[width] duration-700 ease-out",
                index < current || complete
                  ? "w-full"
                  : index === current
                    ? "w-1/2"
                    : "w-0",
              )}
            />
          </li>
        ))}
      </ol>
    </div>
  );
}
