import { TRIAL_DAYS, TRIAL_STORAGE } from "@blinkdisk/constants/space";
import { useAppTranslation } from "@blinkdisk/hooks/use-app-translation";
import { Badge } from "@blinkdisk/ui/badge";
import { Button } from "@blinkdisk/ui/button";
import { cn } from "@blinkdisk/utils/class";
import { CloudBlinkLogo } from "@desktop/components/icons/cloudblink";
import {
  OnboardingHeading,
  OnboardingSection,
} from "@desktop/components/onboarding/step";
import { useOnboardingFolders } from "@desktop/hooks/queries/use-onboarding-folders";
import { useSpace } from "@desktop/hooks/queries/use-space";
import { useAuthDialog } from "@desktop/hooks/state/use-auth-dialog";
import { useOnboarding } from "@desktop/hooks/state/use-onboarding";
import { useAccountId } from "@desktop/hooks/use-account-id";
import { formatSize } from "@desktop/lib/number";
import type { OnboardingStorage as StorageChoice } from "@desktop/lib/onboarding";
import { ArrowRightIcon, CheckIcon } from "lucide-react";
import type { ReactNode } from "react";

const cloudBlinkPoints = ["trial", "offsite", "noSetup"] as const;

export function OnboardingStorage() {
  const { t } = useAppTranslation("onboarding.storage");
  const { isOnlineAccount } = useAccountId();
  const { storage, setStorage, setView, setAwaitingAuth } = useOnboarding();
  const { openAuthDialog } = useAuthDialog();
  const { summary } = useOnboardingFolders();
  const { data: space } = useSpace();

  const available = space ? space.capacity - space.used : TRIAL_STORAGE;
  const size = formatSize(summary.bytes, { round: 1 });
  const isMeasured = !summary.isCalculating && summary.bytes > 0;
  const exceeds = summary.bytes > available;
  const hint =
    storage === "CUSTOM"
      ? t("custom.note")
      : isOnlineAccount
        ? null
        : t("signInHint");

  function next() {
    if (storage === "CUSTOM") return setView("provider");
    if (isOnlineAccount) return setView("password");

    setAwaitingAuth(true);
    openAuthDialog();
  }

  return (
    <>
      <OnboardingHeading title={t("title")} description={t("description")} />
      <OnboardingSection className="mt-8">
        <div role="radiogroup" aria-label={t("title")} className="grid gap-3">
          <StorageOption
            value="CLOUDBLINK"
            selected={storage}
            onSelect={setStorage}
          >
            <span className="flex h-5 items-center justify-between gap-3">
              <CloudBlinkLogo className="h-4 w-auto" />
              <Badge variant="subtle">{t("recommended")}</Badge>
            </span>
            <span className="mt-4 grid gap-1.5">
              {cloudBlinkPoints.map((point) => (
                <span
                  key={point}
                  className="text-muted-foreground flex items-center gap-2.5 text-sm"
                >
                  <CheckIcon className="text-primary size-4 shrink-0" />
                  {t(`cloudblink.points.${point}`, {
                    storage: formatSize(TRIAL_STORAGE),
                    days: TRIAL_DAYS,
                  })}
                </span>
              ))}
            </span>
            {isMeasured ? (
              <span
                className={cn(
                  "animate-in fade-in mt-4 block border-t pt-3 text-xs",
                  exceeds
                    ? "text-amber-600 dark:text-amber-500"
                    : "text-muted-foreground",
                )}
              >
                {exceeds
                  ? t("cloudblink.exceeds", {
                      size,
                      storage: formatSize(available),
                    })
                  : t("cloudblink.fits", { size })}
              </span>
            ) : null}
          </StorageOption>
          <StorageOption
            value="CUSTOM"
            selected={storage}
            onSelect={setStorage}
          >
            <span className="block font-semibold leading-5">
              {t("custom.title")}
            </span>
            <span className="text-muted-foreground mt-1.5 block text-sm">
              {t("custom.description")}
            </span>
          </StorageOption>
        </div>
      </OnboardingSection>
      <OnboardingSection order={2} className="mt-8">
        <Button size="lg" className="w-full" onClick={next}>
          {t(
            storage === "CUSTOM"
              ? "continue.custom"
              : isOnlineAccount
                ? "continue.cloudblink"
                : "continue.signIn",
          )}
          <ArrowRightIcon />
        </Button>
        {hint ? (
          <p className="text-muted-foreground mt-3 text-center text-xs">
            {hint}
          </p>
        ) : null}
      </OnboardingSection>
    </>
  );
}

type StorageOptionProps = {
  value: StorageChoice;
  selected: StorageChoice;
  onSelect: (value: StorageChoice) => void;
  children: ReactNode;
};

function StorageOption({
  value,
  selected,
  onSelect,
  children,
}: StorageOptionProps) {
  const isSelected = value === selected;

  return (
    // biome-ignore lint/a11y/useSemanticElements: a native radio can't hold the card's content
    <button
      type="button"
      role="radio"
      aria-checked={isSelected}
      onClick={() => onSelect(value)}
      className={cn(
        "focus-visible:ring-ring/50 focus-visible:ring-3 flex gap-4 rounded-xl border p-5 text-left outline-none transition-all",
        isSelected
          ? "bg-card border-primary ring-primary/15 ring-4"
          : "hover:bg-card border-border",
      )}
    >
      <span
        aria-hidden="true"
        className={cn(
          "mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full border transition-colors",
          isSelected
            ? "bg-primary border-primary"
            : "border-input bg-secondary",
        )}
      >
        {isSelected ? (
          <span className="bg-primary-foreground size-2 rounded-full" />
        ) : null}
      </span>
      <span className="min-w-0 flex-1">{children}</span>
    </button>
  );
}
