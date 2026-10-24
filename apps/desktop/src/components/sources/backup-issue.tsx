import { useAppTranslation } from "@blinkdisk/hooks/use-app-translation";
import { isFileLikeSource } from "@blinkdisk/schemas/source";
import { Badge } from "@blinkdisk/ui/badge";
import { cn } from "@blinkdisk/utils/class";
import type { CoreSourceItem } from "@desktop/hooks/queries/core/use-source-list";
import {
  type BackupIssueReason,
  getBackupIssue,
} from "@desktop/lib/backup-issue";
import {
  CircleAlertIcon,
  FileXIcon,
  FolderXIcon,
  LockIcon,
  TriangleAlertIcon,
} from "lucide-react";

export function useBackupIssueText() {
  const { t } = useAppTranslation("folder.backupError");

  return (source: CoreSourceItem, reason: BackupIssueReason) => {
    const sourceTypeKey = isFileLikeSource(source.type) ? "file" : "folder";

    return {
      label: t(`label.${reason}.${sourceTypeKey}`),
      description: t(`description.${reason}.${sourceTypeKey}`),
    };
  };
}

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

export function BackupIssueAlert({ source }: { source?: CoreSourceItem }) {
  const { t } = useAppTranslation("folder.backupError");
  const getText = useBackupIssueText();
  const issue = getBackupIssue(source);
  if (!source || !issue) return null;

  const { label, description } = getText(source, issue.reason);
  const warning = issue.reason === "partial";

  return (
    <div
      role="alert"
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
        {issue.message ? (
          <div className="mt-3 flex flex-col gap-1.5">
            <p className="text-muted-foreground text-xs font-medium">
              {t("details")}
            </p>
            <code className="bg-background/70 text-muted-foreground ph-no-capture block rounded-lg border px-3 py-2 font-mono text-xs break-all whitespace-pre-wrap">
              {issue.message}
            </code>
          </div>
        ) : null}
      </div>
    </div>
  );
}
