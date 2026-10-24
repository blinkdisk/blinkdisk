import { useAppTranslation } from "@blinkdisk/hooks/use-app-translation";
import { useBackupIssueText } from "@desktop/components/sources/backup-issue";
import { useStartBackup } from "@desktop/hooks/mutations/core/use-start-backup";
import type { CoreSourceItem } from "@desktop/hooks/queries/core/use-source-list";
import type { SelectedProfile } from "@desktop/hooks/use-profile";
import { useVaultId } from "@desktop/hooks/use-vault-id";
import {
  createBackupResultTracker,
  getBackupIssue,
} from "@desktop/lib/backup-issue";
import { getBackupStartCoordinator } from "@desktop/lib/backup-start-latch";
import { useStore } from "@tanstack/react-store";
import { useEffect, useMemo } from "react";
import { toast } from "sonner";

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
  const { t } = useAppTranslation("folder.backupError");
  const getIssueText = useBackupIssueText();
  const { vaultId } = useVaultId();
  const resultTracker = useMemo(() => createBackupResultTracker(), [vaultId]);
  const coordinator = useMemo(
    () => getBackupStartCoordinator(vaultId || ""),
    [vaultId],
  );
  const isAwaitingStatus = useStore(coordinator);
  const observedSources = useMemo(
    () => sources ?? (source ? [source] : undefined),
    [sources, source],
  );
  const { mutate, isPending } = useStartBackup({
    profile,
    onSuccess: coordinator.settle,
    onError: () => {
      coordinator.release();
      resultTracker.clear();
    },
  });

  useEffect(() => {
    coordinator.observe(observedSources);
    for (const source of resultTracker.observe(observedSources)) {
      const issue = getBackupIssue(source);
      if (!issue) continue;
      const notify = issue.kind === "partial" ? toast.warning : toast.error;
      notify(
        t(`toast.${issue.kind}`, { name: source.name || source.source.path }),
        {
          description: getIssueText(source, issue.reason).description,
        },
      );
    }
  }, [coordinator, observedSources, resultTracker, t, getIssueText]);

  const isStartingBackup = isPending || isAwaitingStatus || isRunning;

  const startBackup = (options: { path?: string }) => {
    const targets = observedSources?.filter(
      (source) => !options.path || source.source.path === options.path,
    );
    if (
      !vaultId ||
      isPending ||
      isRunning ||
      !targets?.length ||
      !coordinator.begin(targets)
    )
      return;

    resultTracker.start(targets);
    mutate(options);
  };

  return { startBackup, isStartingBackup };
}
