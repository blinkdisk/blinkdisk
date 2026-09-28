import { useStartBackup } from "@desktop/hooks/mutations/core/use-start-backup";
import type { SelectedProfile } from "@desktop/hooks/use-profile";
import { createBackupStartLatch } from "@desktop/lib/backup-start-latch";
import { useEffect, useRef, useState } from "react";

type Options = {
  profile?: SelectedProfile;
  isRunning?: boolean;
  latestSnapshotId?: string;
};

export function useBackupStartFeedback({
  profile,
  isRunning = false,
  latestSnapshotId,
}: Options) {
  const { mutate, isPending } = useStartBackup({ profile });
  const [awaitingStatus, setAwaitingStatus] = useState(false);
  const latch = useRef(createBackupStartLatch());

  useEffect(() => {
    if (latch.current.observe(isRunning, latestSnapshotId)) {
      setAwaitingStatus(false);
    }
  }, [isRunning, latestSnapshotId]);

  const isStartingBackup = isPending || awaitingStatus || isRunning;

  const startBackup = (options: { path?: string }) => {
    if (isPending || isRunning || !latch.current.tryStart(latestSnapshotId))
      return;

    setAwaitingStatus(true);
    mutate(options, {
      onError: () => {
        latch.current.release();
        setAwaitingStatus(false);
      },
    });
  };

  return { startBackup, isStartingBackup };
}
