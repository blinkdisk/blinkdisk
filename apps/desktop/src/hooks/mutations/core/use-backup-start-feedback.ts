import { useStartBackup } from "@desktop/hooks/mutations/core/use-start-backup";
import type { CoreSourceItem } from "@desktop/hooks/queries/core/use-source-list";
import type { SelectedProfile } from "@desktop/hooks/use-profile";
import { useVaultId } from "@desktop/hooks/use-vault-id";
import { getBackupStartCoordinator } from "@desktop/lib/backup-start-latch";
import { useStore } from "@tanstack/react-store";
import { useEffect, useMemo } from "react";

type Options = {
  profile?: SelectedProfile;
  isRunning?: boolean;
  source?: CoreSourceItem;
  sources?: CoreSourceItem[] | null;
};

export function useBackupStartFeedback({
  profile,
  isRunning = false,
  source,
  sources,
}: Options) {
  const { vaultId } = useVaultId();
  const coordinator = getBackupStartCoordinator(vaultId || "");
  const isAwaitingStatus = useStore(coordinator.store);
  const observedSources = useMemo(
    () => sources ?? (source ? [source] : undefined),
    [sources, source],
  );
  const { mutate, isPending } = useStartBackup({
    profile,
    onSuccess: coordinator.settle,
    onError: coordinator.release,
  });

  useEffect(() => {
    coordinator.observe(observedSources);
  }, [coordinator, observedSources]);

  const isStartingBackup = isPending || isAwaitingStatus || isRunning;

  const startBackup = (options: { path?: string }) => {
    if (
      !vaultId ||
      isPending ||
      isRunning ||
      !coordinator.begin(observedSources)
    )
      return;

    mutate(options);
  };

  return { startBackup, isStartingBackup };
}
