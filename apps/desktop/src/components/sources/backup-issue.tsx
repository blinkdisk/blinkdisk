import { useAppTranslation } from "@blinkdisk/hooks/use-app-translation";
import { isFileLikeSource } from "@blinkdisk/schemas/source";
import { Badge } from "@blinkdisk/ui/badge";
import { Button } from "@blinkdisk/ui/button";
import { cn } from "@blinkdisk/utils/class";
import { BackupIssueDialog } from "@desktop/components/dialogs/backup-issue";
import type { CoreSourceItem } from "@desktop/hooks/queries/core/use-source-list";
import { useTaskDialog } from "@desktop/hooks/state/use-task-dialog";
import { useBackupIssueText } from "@desktop/hooks/use-backup-issue-text";
import {
  type BackupIssueReason,
  getBackupIssue,
} from "@desktop/lib/backup-issue";
import {
  ArrowRightIcon,
  CircleAlertIcon,
  FileXIcon,
  FolderXIcon,
  LockIcon,
  TriangleAlertIcon,
} from "lucide-react";
import { useRef, useState } from "react";

function BackupIssueIcon({
  source,
  reason,
  className,
}: {
  source: CoreSourceItem;
  reason: BackupIssueReason;
  className?: string;
}) {
  const Icon =
    reason === "missing"
      ? isFileLikeSource(source.type)
        ? FileXIcon
        : FolderXIcon
      : reason === "permission"
        ? LockIcon
        : reason === "partial"
          ? TriangleAlertIcon
          : CircleAlertIcon;

  return <Icon className={className} />;
}

export function BackupIssueBadge({ source }: { source?: CoreSourceItem }) {
  const getText = useBackupIssueText();
  const issue = getBackupIssue(source);
  if (!source || !issue) return null;

  return (
    <Badge
      variant="destructive"
      className={cn(
        issue.reason === "partial" &&
          "bg-amber-500/10 text-amber-600 dark:bg-amber-500/20 dark:text-amber-500",
      )}
    >
      <BackupIssueIcon source={source} reason={issue.reason} />
      {getText(source, issue.reason).label}
    </Badge>
  );
}

export function BackupIssueAlert({
  source: liveSource,
}: {
  source?: CoreSourceItem;
}) {
  const { t } = useAppTranslation("folder.backupError");
  const getText = useBackupIssueText();
  const { openTaskDialog } = useTaskDialog();
  const [selectedSource, setSelectedSource] = useState<CoreSourceItem | null>(
    null,
  );
  const triggerRef = useRef<HTMLButtonElement>(null);
  const source = selectedSource || liveSource;
  const issue = getBackupIssue(source);
  if (!source || !issue) return null;

  const { label, description } = getText(source, issue.reason);
  const warning = issue.reason === "partial";

  return (
    <>
      <div
        className={cn(
          "mb-6 flex gap-4 rounded-2xl border p-4",
          warning
            ? "border-amber-500/30 bg-amber-500/5"
            : "border-destructive/25 bg-destructive/5",
        )}
      >
        <div
          className={cn(
            "flex size-10 shrink-0 items-center justify-center rounded-xl",
            warning
              ? "bg-amber-500/15 text-amber-600 dark:text-amber-500"
              : "bg-destructive/10 text-destructive",
          )}
        >
          <BackupIssueIcon
            source={source}
            reason={issue.reason}
            className="size-5"
          />
        </div>
        <div className="flex min-w-0 flex-1 flex-col gap-0.5">
          <p className="font-semibold">{label}</p>
          <p className="text-muted-foreground text-sm">{description}</p>
          <Button
            ref={triggerRef}
            variant="link"
            className="mt-2 h-auto w-fit p-0 text-xs"
            onClick={() => setSelectedSource(source)}
            aria-haspopup="dialog"
          >
            {t("viewDetails")}
            <ArrowRightIcon className="size-3.5" />
          </Button>
        </div>
      </div>
      {selectedSource && (
        <BackupIssueDialog
          source={selectedSource}
          finalFocus={triggerRef}
          onOpenChange={(open) => {
            if (!open) setSelectedSource(null);
          }}
          onViewLogs={(taskId) => {
            setSelectedSource(null);
            openTaskDialog({ taskId });
          }}
        />
      )}
    </>
  );
}
