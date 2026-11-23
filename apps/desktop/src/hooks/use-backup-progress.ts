import { useSourceList } from "@desktop/hooks/queries/core/use-source-list";
import { useOnboardingFolders } from "@desktop/hooks/queries/use-onboarding-folders";
import { useVaultStatus } from "@desktop/hooks/queries/use-vault-status";
import { useOnboarding } from "@desktop/hooks/state/use-onboarding";
import { useLocalProfile } from "@desktop/hooks/use-local-profile";
import { getBackupView, summarizeBackup } from "@desktop/lib/onboarding";
import { profileFromParts } from "@desktop/lib/profile";
import { useMemo } from "react";

export function useBackupProgress() {
  const { status: vaultStatus } = useVaultStatus();
  const { firstBackup } = useOnboarding();
  const { sizes } = useOnboardingFolders();
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
  });

  return { view, backup, sources, profile };
}
