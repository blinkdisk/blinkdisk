import { useAppTranslation } from "@blinkdisk/hooks/use-app-translation";
import { useClipboard } from "@blinkdisk/hooks/use-clipboard";
import { isFileLikeSource } from "@blinkdisk/schemas/source";
import { Button } from "@blinkdisk/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
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
  getEntryErrorReason,
} from "@desktop/lib/backup-issue";
import {
  CheckIcon,
  CircleAlertIcon,
  ClockIcon,
  CopyIcon,
  FileIcon,
  FileQuestionIcon,
  FolderIcon,
  InfoIcon,
  ScrollTextIcon,
  TriangleAlertIcon,
} from "lucide-react";
import { type RefObject, useRef, useState } from "react";

function splitPath(path: string) {
  const index = Math.max(path.lastIndexOf("/"), path.lastIndexOf("\\"));
  return {
    name: path.slice(index + 1) || path,
    folder: index > 0 ? path.slice(0, index) : undefined,
  };
}

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
  const doneRef = useRef<HTMLButtonElement>(null);
  const [copyStatus, setCopyStatus] = useState<"idle" | "copied" | "failed">(
    "idle",
  );
  const issue = getBackupIssue(source);
  const details = getBackupIssueDetails(source);
  if (!issue || !details) return null;

  const { label, description } = getText(source, issue.reason);
  const partial = issue.kind === "partial";
  const Icon = partial ? TriangleAlertIcon : CircleAlertIcon;
  const SourceIcon = isFileLikeSource(source.type) ? FileIcon : FolderIcon;
  const date = details.startTime
    ? formatBackupDate({ startTime: details.startTime })
    : undefined;
  const unavailable =
    details.entries.length === 0 &&
    (partial || details.totalCount > 0 || !issue.message);
  const limitation = details.isTruncated
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
      unavailable ? t("unavailable") : limitation,
    ]
      .filter(Boolean)
      .join("\n\n");
    setCopyStatus((await copy(text)) ? "copied" : "failed");
  }

  return (
    <Dialog open onOpenChange={onOpenChange}>
      <DialogContent
        initialFocus={doneRef}
        finalFocus={finalFocus}
        className="flex max-h-[85vh] w-152 flex-col gap-0 overflow-hidden p-0"
      >
        <DialogHeader className="shrink-0 flex-row gap-4 p-6 pr-14">
          <div
            className={cn(
              "flex size-10 shrink-0 items-center justify-center rounded-xl",
              partial
                ? "bg-amber-500/15 text-amber-600 dark:text-amber-500"
                : "bg-destructive/10 text-destructive",
            )}
          >
            <Icon className="size-5" />
          </div>
          <div className="flex min-w-0 flex-col gap-2">
            <DialogTitle className="text-lg leading-tight">{label}</DialogTitle>
            <DialogDescription className="leading-relaxed">
              {description}
            </DialogDescription>
            <div className="text-muted-foreground mt-1 flex min-w-0 flex-wrap items-center gap-x-4 gap-y-1.5 text-xs">
              <span className="flex min-w-0 items-center gap-1.5">
                <SourceIcon className="size-3.5 shrink-0" />
                <span
                  className="ph-no-capture truncate select-text"
                  title={source.source.path}
                >
                  {source.source.path}
                </span>
              </span>
              {date && (
                <span className="flex shrink-0 items-center gap-1.5">
                  <ClockIcon className="size-3.5" />
                  {date}
                </span>
              )}
            </div>
          </div>
        </DialogHeader>

        <div className="flex min-h-0 flex-col gap-3 overflow-y-auto px-6 pb-6">
          {issue.message && (
            <section className="flex flex-col gap-2">
              <h3 className="text-muted-foreground text-xs font-medium">
                {t("error")}
              </h3>
              <pre className="ph-no-capture bg-muted/60 rounded-lg border p-3.5 font-mono text-xs leading-relaxed break-all whitespace-pre-wrap select-text">
                {issue.message}
              </pre>
            </section>
          )}

          {details.entries.length > 0 && (
            <section className="flex flex-col gap-2">
              <div className="flex items-baseline justify-between gap-3">
                <h3 className="text-muted-foreground text-xs font-medium">
                  {t("errors")}
                </h3>
                <span className="text-muted-foreground text-xs tabular-nums">
                  {t("count", { count: details.totalCount })}
                </span>
              </div>
              <div className="bg-card overflow-hidden rounded-xl border">
                <ul className="ph-no-capture divide-border divide-y select-text">
                  {details.entries.map((entry, index) => {
                    const { name, folder } = splitPath(entry.path);
                    return (
                      <li
                        key={`${entry.path}:${index}`}
                        className="flex items-center gap-3 px-3.5 py-3"
                      >
                        <div className="bg-muted text-muted-foreground flex size-8 shrink-0 items-center justify-center rounded-lg">
                          <FileIcon className="size-4" />
                        </div>
                        <div className="flex min-w-0 flex-1 flex-col gap-0.5">
                          <p
                            className="flex min-w-0 items-baseline gap-2"
                            title={entry.path}
                          >
                            <span className="truncate font-medium">{name}</span>
                            {folder && (
                              <span className="text-muted-foreground min-w-0 truncate text-xs">
                                {folder}
                              </span>
                            )}
                          </p>
                          <p
                            className={cn(
                              "text-xs leading-relaxed break-words",
                              partial
                                ? "text-amber-700 dark:text-amber-500"
                                : "text-destructive",
                            )}
                            title={entry.error}
                          >
                            {getEntryErrorReason(entry.error)}
                          </p>
                        </div>
                      </li>
                    );
                  })}
                </ul>
                {limitation && (
                  <p className="bg-muted/50 text-muted-foreground flex items-center gap-2 border-t px-3.5 py-2.5 text-xs">
                    <InfoIcon className="size-3.5 shrink-0" />
                    {limitation}
                  </p>
                )}
              </div>
            </section>
          )}

          {unavailable && (
            <div className="text-muted-foreground flex flex-col items-center gap-2 rounded-xl border border-dashed px-6 py-8 text-center text-xs">
              <FileQuestionIcon className="size-5" />
              <p className="max-w-80 leading-relaxed">{t("unavailable")}</p>
            </div>
          )}

          {details.ignoredErrorCount > 0 && (
            <p className="text-muted-foreground text-xs leading-relaxed">
              {t("ignored", { count: details.ignoredErrorCount })}
            </p>
          )}
        </div>

        <div className="bg-muted/30 shrink-0 border-t px-6 py-4">
          <div className="flex flex-wrap items-center gap-2">
            {details.taskId && (
              <Button
                variant="ghost"
                size="sm"
                className="-ml-2"
                onClick={() => {
                  if (details.taskId) onViewLogs(details.taskId);
                }}
              >
                <ScrollTextIcon />
                {t("logs")}
              </Button>
            )}
            <div className="ml-auto flex gap-2">
              <Button variant="secondary" size="sm" onClick={copyDetails}>
                {copyStatus === "copied" ? <CheckIcon /> : <CopyIcon />}
                {copyStatus === "copied" ? t("copied") : t("copy")}
              </Button>
              <Button
                ref={doneRef}
                size="sm"
                onClick={() => onOpenChange(false)}
              >
                {t("close")}
              </Button>
            </div>
          </div>
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
