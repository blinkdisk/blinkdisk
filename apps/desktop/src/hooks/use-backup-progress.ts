import { useSourceList } from "@desktop/hooks/queries/core/use-source-list";
import { useOnboardingFolders } from "@desktop/hooks/queries/use-onboarding-folders";
import { useVaultStatus } from "@desktop/hooks/queries/use-vault-status";
import { useOnboarding } from "@desktop/hooks/state/use-onboarding";
import { useAppStorage } from "@desktop/hooks/use-app-storage";
import { useLocalProfile } from "@desktop/hooks/use-local-profile";
import { getBackupView, summarizeBackup } from "@desktop/lib/onboarding";
import { profileFromParts } from "@desktop/lib/profile";
import { useMemo } from "react";

export function useBackupProgress() {
  const { status: vaultStatus } = useVaultStatus();
  const { firstBackup } = useOnboarding();
  const { sizes } = useOnboardingFolders();
  const [failedPaths] = useAppStorage("onboarding.failedPaths");
  const { localHostName, localUserName } = useLocalProfile();

  const profile = useMemo(
    () =>
      profileFromParts({ hostName: localHostName, userName: localUserName }),
    [localHostName, localUserName],
  );
  const { data: sources } = useSourceList({ profile });

  const backup = useMemo(
    () => summarizeBackup(sources, sizes),
    [sources, sizes],
  );
  const view = getBackupView({
    vaultStatus,
    firstBackupStatus: firstBackup.status,
    sources,
    hasFailedFolders: !!failedPaths?.length,
  });

  return { view, backup, sources, profile, failedPaths: failedPaths || [] };
}
