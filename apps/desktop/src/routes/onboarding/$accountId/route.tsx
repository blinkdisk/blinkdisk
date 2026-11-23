import { UpgradeDialog } from "@desktop/components/dialogs/upgrade";
import { OnboardingShell } from "@desktop/components/onboarding/shell";
import { useOnboarding } from "@desktop/hooks/state/use-onboarding";
import { useBackupProgress } from "@desktop/hooks/use-backup-progress";
import { useOnboardingExit } from "@desktop/hooks/use-onboarding-exit";
import { useSubscriptionWatch } from "@desktop/hooks/use-subscription-watch";
import { useSyncListener } from "@desktop/hooks/use-sync-listener";
import { useVaultId } from "@desktop/hooks/use-vault-id";
import { getPreviousView, getViewStep } from "@desktop/lib/onboarding";
import { createFileRoute, Outlet } from "@tanstack/react-router";

export const Route = createFileRoute("/onboarding/$accountId")({
  component: RouteComponent,
});

function RouteComponent() {
  useSubscriptionWatch();
  useSyncListener();

  const { vaultId } = useVaultId();
  const { view, storage, setView } = useOnboarding();
  const { view: backupView } = useBackupProgress();
  const { exitOnboarding } = useOnboardingExit();

  const previousView = vaultId ? null : getPreviousView(view, storage);

  return (
    <>
      <UpgradeDialog />
      <OnboardingShell
        step={vaultId ? "backup" : getViewStep(view)}
        complete={backupView === "DONE"}
        onBack={previousView ? () => setView(previousView) : undefined}
        onSkip={
          vaultId ? undefined : () => exitOnboarding("skipped", { step: view })
        }
      >
        <Outlet />
      </OnboardingShell>
    </>
  );
}
