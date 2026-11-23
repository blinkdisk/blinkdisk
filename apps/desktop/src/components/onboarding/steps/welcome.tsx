import { useAppTranslation } from "@blinkdisk/hooks/use-app-translation";
import { Button } from "@blinkdisk/ui/button";
import {
  OnboardingHeading,
  OnboardingSection,
} from "@desktop/components/onboarding/step";
import { useAuthDialog } from "@desktop/hooks/state/use-auth-dialog";
import { useOnboarding } from "@desktop/hooks/state/use-onboarding";
import { useAccountId } from "@desktop/hooks/use-account-id";
import { ArrowRightIcon, CodeXmlIcon, LockIcon } from "lucide-react";

const facts = [
  { key: "encrypted", icon: LockIcon },
  { key: "openSource", icon: CodeXmlIcon },
] as const;

export function OnboardingWelcome() {
  const { t } = useAppTranslation("onboarding.welcome");
  const { isOnlineAccount } = useAccountId();
  const { setView, setAwaitingAuth } = useOnboarding();
  const { openAuthDialog } = useAuthDialog();

  return (
    <>
      <OnboardingHeading
        size="lg"
        eyebrow={t("eyebrow")}
        title={t("title")}
        description={t("description")}
      />
      <OnboardingSection className="mt-10 flex items-center gap-2">
        <Button size="xl" onClick={() => setView("folders")}>
          {t("start")}
          <ArrowRightIcon />
        </Button>
        {!isOnlineAccount ? (
          <Button
            size="xl"
            variant="ghost"
            className="text-muted-foreground px-5 text-sm"
            onClick={() => {
              setAwaitingAuth(false);
              openAuthDialog();
            }}
          >
            {t("signIn")}
          </Button>
        ) : null}
      </OnboardingSection>
      <OnboardingSection order={2} className="mt-14">
        <ul className="text-muted-foreground flex flex-wrap gap-x-6 gap-y-2 text-sm">
          {facts.map(({ key, icon: Icon }) => (
            <li key={key} className="flex items-center gap-2">
              <Icon className="size-4" />
              {t(`facts.${key}`)}
            </li>
          ))}
        </ul>
      </OnboardingSection>
    </>
  );
}
