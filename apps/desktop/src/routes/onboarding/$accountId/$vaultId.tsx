import { OnboardingBackup } from "@desktop/components/onboarding/steps/backup";
import { useSpaceUpdate } from "@desktop/hooks/use-space-update";
import { useTaskbarProgress } from "@desktop/hooks/use-taskbar-progress";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/onboarding/$accountId/$vaultId")({
  component: RouteComponent,
});

function RouteComponent() {
  useSpaceUpdate();
  useTaskbarProgress();

  return <OnboardingBackup />;
}
