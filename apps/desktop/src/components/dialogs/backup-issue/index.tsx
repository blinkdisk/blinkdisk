import { useAppTranslation } from "@blinkdisk/hooks/use-app-translation";
import { useClipboard } from "@blinkdisk/hooks/use-clipboard";
import { Badge } from "@blinkdisk/ui/badge";
import { Button } from "@blinkdisk/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@blinkdisk/ui/dialog";
import { cn } from "@blinkdisk/utils/class";
import type { CoreSourceItem } from "@desktop/hooks/queries/core/use-source-list";
import { useBackupIssueText } from "@desktop/hooks/use-backup-issue-text";
import { formatBackupDate } from "@desktop/lib/backup";
import {
  getBackupIssue,
  getBackupIssueDetails,
} from "@desktop/lib/backup-issue";
import {
  CheckIcon,
  CircleAlertIcon,
  CopyIcon,
  FileXIcon,
  InfoIcon,
  ScrollTextIcon,
  TriangleAlertIcon,
} from "lucide-react";
import { type RefObject, useState } from "react";

export function BackupIssueDialog({
  source,
  onOpenChange,
  onViewLogs,
  finalFocus,
}: {
  source: CoreSourceItem;
  onOpenChange: (open: boolean) => void;
  onViewLogs: (taskId: string) => void;
  finalFocus: RefObject<HTMLButtonElement | null>;
}) {
  const { t } = useAppTranslation("folder.backupError.dialog");
  const getText = useBackupIssueText();
  const { copy } = useClipboard();
  const [copyStatus, setCopyStatus] = useState<"idle" | "copied" | "failed">(
    "idle",
  );
  const issue = getBackupIssue(source);
  const details = getBackupIssueDetails(source);
  if (!issue || !details) return null;

  const { label, description } = getText(source, issue.reason);
  const partial = issue.kind === "partial";
  const Icon = partial ? TriangleAlertIcon : CircleAlertIcon;
  const date = details.startTime
    ? formatBackupDate({ startTime: details.startTime })
    : undefined;
  const unavailable =
    details.entries.length === 0 && (partial || details.totalCount > 0);
  const limitation = unavailable
    ? t("unavailable")
    : details.isTruncated
      ? t("limited", {
          shown: details.entries.length,
          total: details.totalCount,
        })
      : undefined;

  async function copyDetails() {
    if (!details) return;
    const text = [
      label,
      source.source.path,
      date,
      description,
      issue?.message,
      details.totalCount
        ? t("count", { count: details.totalCount })
        : undefined,
      ...details.entries.map((entry) => `${entry.path}\n${entry.error}`),
      details.ignoredErrorCount
        ? t("ignored", { count: details.ignoredErrorCount })
        : undefined,
      limitation,
    ]
      .filter(Boolean)
      .join("\n\n");
    setCopyStatus((await copy(text)) ? "copied" : "failed");
  }

  return (
    <Dialog open onOpenChange={onOpenChange}>
      <DialogContent
        finalFocus={finalFocus}
        className="flex max-h-[85vh] w-152 flex-col gap-0 overflow-hidden p-0"
      >
        <DialogHeader className="shrink-0 gap-5 p-6 pb-5">
          <div className="flex items-center gap-3.5 pr-8">
            <div
              className={cn(
                "flex size-11 shrink-0 items-center justify-center rounded-xl",
                partial
                  ? "bg-amber-500/15 text-amber-600 dark:text-amber-500"
                  : "bg-destructive/10 text-destructive",
              )}
            >
              <Icon className="size-5" />
            </div>
            <div className="flex min-w-0 flex-col gap-1.5">
              <DialogTitle>{t("title")}</DialogTitle>
              <p className="text-muted-foreground text-sm">{label}</p>
            </div>
          </div>
          <DialogDescription>{description}</DialogDescription>
          <div className="bg-muted/60 flex flex-wrap justify-between gap-x-6 gap-y-3 rounded-xl border px-4 py-3">
            <div className="min-w-0 flex-1">
              <p className="text-muted-foreground mb-1 text-xs">
                {t("source")}
              </p>
              <p className="ph-no-capture font-mono text-xs break-all select-text">
                {source.source.path}
              </p>
            </div>
            {date && (
              <div>
                <p className="text-muted-foreground mb-1 text-xs">
                  {t("backup")}
                </p>
                <p className="text-xs">{date}</p>
              </div>
            )}
          </div>
        </DialogHeader>

        <div className="min-h-0 overflow-y-auto px-6 pb-6">
          {issue.message && (
            <div className="mb-4 last:mb-0">
              <h3 className="mb-2 text-sm font-medium">{t("error")}</h3>
              <pre className="ph-no-capture bg-destructive/5 border-destructive/15 rounded-xl border p-4 font-mono text-xs leading-relaxed break-all whitespace-pre-wrap select-text">
                {issue.message}
              </pre>
            </div>
          )}

          {details.entries.length > 0 && (
            <>
              <div className="mb-3 flex items-center justify-between gap-3">
                <h3 className="text-sm font-medium">{t("errors")}</h3>
                <Badge variant="muted">
                  {t("count", { count: details.totalCount })}
                </Badge>
              </div>
              <ul className="ph-no-capture bg-card divide-border divide-y overflow-hidden rounded-xl border select-text">
                {details.entries.map((entry, index) => (
                  <li
                    key={`${entry.path}:${index}`}
                    className="flex items-start gap-3 px-4 py-3.5"
                  >
                    <FileXIcon className="text-muted-foreground mt-0.5 size-4 shrink-0" />
                    <div className="min-w-0 space-y-1.5">
                      <p className="font-mono text-xs leading-relaxed break-all whitespace-pre-wrap">
                        {entry.path}
                      </p>
                      <p className="text-muted-foreground text-xs leading-relaxed break-words whitespace-pre-wrap">
                        {entry.error}
                      </p>
                    </div>
                  </li>
                ))}
              </ul>
            </>
          )}

          {limitation && (
            <div className="text-muted-foreground mt-3 flex items-start gap-2.5 rounded-lg bg-amber-500/5 p-3 text-xs leading-relaxed">
              <InfoIcon className="mt-0.5 size-3.5 shrink-0" />
              <p>{limitation}</p>
            </div>
          )}
          {details.ignoredErrorCount > 0 && (
            <p className="text-muted-foreground mt-3 text-xs leading-relaxed">
              {t("ignored", { count: details.ignoredErrorCount })}
            </p>
          )}
        </div>

        <div className="shrink-0 border-t p-6 pt-4">
          <DialogFooter className="m-0 flex-wrap items-center p-0">
            {details.taskId && (
              <Button
                variant="ghost"
                className="sm:mr-auto"
                onClick={() => {
                  if (details.taskId) onViewLogs(details.taskId);
                }}
              >
                <ScrollTextIcon />
                {t("logs")}
              </Button>
            )}
            <Button variant="secondary" onClick={() => onOpenChange(false)}>
              {t("close")}
            </Button>
            <Button onClick={copyDetails}>
              {copyStatus === "copied" ? <CheckIcon /> : <CopyIcon />}
              {copyStatus === "copied" ? t("copied") : t("copy")}
            </Button>
          </DialogFooter>
          <p role="status" className="sr-only">
            {copyStatus === "copied" ? t("copied") : ""}
          </p>
          {copyStatus === "failed" && (
            <p role="alert" className="text-destructive mt-3 text-xs">
              {t("copyFailed")}
            </p>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
