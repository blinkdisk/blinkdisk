import { useCancelTask } from "@desktop/hooks/mutations/core/use-cancel-task";
import { useTask } from "@desktop/hooks/queries/core/use-task";
import {
  CoreTaskLogEntry,
  useTaskLogs,
} from "@desktop/hooks/queries/core/use-task-logs";
import { useTaskDialog } from "@desktop/hooks/state/use-task-dialog";
import { useAppTranslation } from "@hooks/use-app-translation";
import { Badge } from "@ui/badge";
import { Button } from "@ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@ui/dialog";
import { LoaderCircleIcon } from "lucide-react";
import { memo } from "react";

function formatTimestamp(ts: number) {
  const date = new Date(ts * 1000);
  return date.toLocaleTimeString(undefined, {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
}

function getStatusVariant(status: string) {
  switch (status) {
    case "SUCCESS":
      return "default" as const;
    case "RUNNING":
    case "CANCELING":
      return "subtle" as const;
    case "FAILED":
    case "CANCELED":
      return "destructive" as const;
    default:
      return "muted" as const;
  }
}

function getExtraFields(log: CoreTaskLogEntry) {
  const reserved = new Set(["level", "ts", "mod", "msg"]);
  return Object.entries(log).filter(([key]) => !reserved.has(key));
}

function formatValue(value: unknown): string {
  if (value === null || value === undefined) return "null";
  if (typeof value === "object") {
    const str = JSON.stringify(value);
    return str === "{}" ? "{}" : str;
  }
  return String(value);
}

const LogEntry = memo(function LogEntry({ log }: { log: CoreTaskLogEntry }) {
  const extras = getExtraFields(log);

  return (
    <p className="text-sm">
      <span className="text-muted-foreground shrink-0">
        {formatTimestamp(log.ts)}{" "}
      </span>
      <span className="text-primary/70 shrink-0"> [{log.mod}] </span>
      <span className="text-foreground wrap-break-word mt-0.5 min-w-0">
        {log.msg}
      </span>
      {extras.length > 0 && (
        <>
          {extras.map(([key, value]) => (
            <span key={key}>
              <span className="text-muted-foreground/70">{key}=</span>
              <span className="text-foreground/60">{formatValue(value)}</span>
            </span>
          ))}
        </>
      )}
    </p>
  );

  return (
    <div className="border-border/50 hover:bg-muted/30 border-b px-3 py-2 font-mono text-xs last:border-b-0">
      <div className="flex items-start gap-2">
        <span className="text-muted-foreground shrink-0">
          {formatTimestamp(log.ts)}
        </span>
        <span className="text-primary/70 shrink-0">[{log.mod}]</span>
      </div>
      {extras.length > 0 && (
        <div className="text-muted-foreground ml-[calc(theme(spacing2)+8ch)] mt-1 flex flex-wrap gap-x-3 gap-y-0.5">
          {extras.map(([key, value]) => (
            <span key={key}>
              <span className="text-muted-foreground/70">{key}=</span>
              <span className="text-foreground/60">{formatValue(value)}</span>
            </span>
          ))}
        </div>
      )}
    </div>
  );
});

export function TaskDialog() {
  const { t } = useAppTranslation("task.dialog");
  const { isOpen, setIsOpen, options } = useTaskDialog();
  const { data: task, isLoading: isTaskLoading } = useTask(
    options?.taskId,
    isOpen,
  );
  const { data: logs } = useTaskLogs(options?.taskId, isOpen);
  const { mutate: cancelTask, isPending: isCancelPending } = useCancelTask();

  const isActive = task?.status === "RUNNING" || task?.status === "CANCELING";

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="size-160 flex max-h-[90vh] max-w-[90vw] flex-col">
        <DialogHeader>
          <div className="flex items-center gap-2.5">
            <DialogTitle>
              {isTaskLoading
                ? t("title.loading")
                : task
                  ? `${task.kind}: ${task.description}`
                  : t("title.fallback")}
            </DialogTitle>
            {task && (
              <Badge variant={getStatusVariant(task.status)}>
                {t(`status.${task.status}`)}
              </Badge>
            )}
          </div>
          <DialogDescription className="sr-only">
            {task?.description ?? t("description.loading")}
          </DialogDescription>
        </DialogHeader>

        {task?.progressInfo && (
          <p className="text-muted-foreground mt-1 text-sm">
            {task.progressInfo}
          </p>
        )}

        {task?.counters && Object.keys(task.counters).length > 0 && (
          <div className="mt-2 flex flex-wrap gap-2">
            {Object.entries(task.counters).map(([key, value]) => (
              <Badge key={key} variant="muted">
                {key}: {value}
              </Badge>
            ))}
          </div>
        )}

        <div className="bg-muted/40 border-border mt-4 flex min-h-0 flex-col gap-2 overflow-y-auto rounded-lg border p-4">
          {!logs || logs.length === 0 ? (
            <div className="text-muted-foreground flex items-center justify-center p-8 text-sm">
              {isActive ? (
                <span className="flex items-center gap-2">
                  <LoaderCircleIcon className="size-4 animate-spin" />
                  {t("logs.waiting")}
                </span>
              ) : (
                t("logs.empty")
              )}
            </div>
          ) : (
            <>
              {logs.map((log, i) => (
                <LogEntry key={i} log={log} />
              ))}
            </>
          )}
        </div>

        <DialogFooter className="mt-4">
          <Button variant="outline" onClick={() => setIsOpen(false)}>
            {t("close")}
          </Button>
          {task?.status === "RUNNING" && (
            <Button
              variant="destructive"
              loading={isCancelPending}
              onClick={() => {
                if (options?.taskId) cancelTask({ taskId: options.taskId });
              }}
            >
              {t("cancel")}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
