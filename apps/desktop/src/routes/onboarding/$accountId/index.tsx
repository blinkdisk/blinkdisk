import {
  OnboardingConfig,
  OnboardingProvider,
} from "@desktop/components/onboarding/steps/custom-storage";
import { OnboardingFolders } from "@desktop/components/onboarding/steps/folders";
import { OnboardingPassword } from "@desktop/components/onboarding/steps/password";
import { OnboardingStorage } from "@desktop/components/onboarding/steps/storage";
import { OnboardingWelcome } from "@desktop/components/onboarding/steps/welcome";
import { useOnboarding } from "@desktop/hooks/state/use-onboarding";
import type { OnboardingView } from "@desktop/lib/onboarding";
import { createFileRoute } from "@tanstack/react-router";
import { usePostHog } from "posthog-js/react";
import { type ComponentType, useEffect } from "react";

export const Route = createFileRoute("/onboarding/$accountId/")({
  component: RouteComponent,
});

const views: Record<OnboardingView, ComponentType> = {
  welcome: OnboardingWelcome,
  folders: OnboardingFolders,
  storage: OnboardingStorage,
  provider: OnboardingProvider,
  config: OnboardingConfig,
  password: OnboardingPassword,
};

function RouteComponent() {
  const { view } = useOnboarding();
  const posthog = usePostHog();

  useEffect(() => {
    posthog.capture("onboarding_step_viewed", { step: view });
  }, [view, posthog]);

  const View = views[view];

  return <View key={view} />;
}
