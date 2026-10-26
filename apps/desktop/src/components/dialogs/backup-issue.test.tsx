import { BackupIssueDialog } from "@desktop/components/dialogs/backup-issue";
import { TaskDialog } from "@desktop/components/dialogs/task";
import type { CoreSourceItem } from "@desktop/hooks/queries/core/use-source-list";
import type { CoreTaskLogEntry } from "@desktop/hooks/queries/core/use-task-logs";
import type { PropsWithChildren } from "react";
import { renderToStaticMarkup } from "react-dom/server";

const queryState = vi.hoisted(() => ({
  taskError: false,
  logsError: false,
  logs: undefined as CoreTaskLogEntry[] | undefined,
  status: "SUCCESS",
}));

vi.mock("@blinkdisk/hooks/use-app-translation", () => ({
  useAppTranslation: (namespace: string) => ({
    t: (key: string) => `${namespace}.${key}`,
  }),
}));

vi.mock("@blinkdisk/ui/dialog", () => {
  const Content = ({ children }: PropsWithChildren) => children;
  return {
    Dialog: Content,
    DialogContent: Content,
    DialogHeader: Content,
    DialogTitle: Content,
    DialogDescription: Content,
    DialogFooter: Content,
  };
});

vi.mock("@desktop/hooks/queries/core/use-task", () => ({
  useTask: () => ({
    isError: queryState.taskError,
    isLoading: false,
    data: queryState.taskError
      ? undefined
      : { kind: "Snapshot", description: "Backup", status: queryState.status },
  }),
}));

vi.mock("@desktop/hooks/queries/core/use-task-logs", () => ({
  useTaskLogs: () => ({
    data: queryState.logs,
    isError: queryState.logsError,
  }),
}));

vi.mock("@desktop/hooks/mutations/core/use-cancel-task", () => ({
  useCancelTask: () => ({ mutate: vi.fn(), isPending: false }),
}));

vi.mock("@desktop/hooks/state/use-task-dialog", () => ({
  useTaskDialog: () => ({
    isOpen: true,
    setIsOpen: vi.fn(),
    options: { taskId: "task-1" },
  }),
}));

function backupSource(status: "FAILED" | "PARTIAL", errorMessage?: string) {
  return {
    id: "photos",
    type: "directory",
    source: { host: "laptop", userName: "alex", path: "/photos" },
    status: "IDLE",
    schedule: { runMissed: false },
    currentTask: "",
    currentTaskStatus: "SUCCESS",
    lastBackupOutcome: {
      id: "outcome-1",
      status,
      startTime: "2026-10-24T10:00:00Z",
      endTime: "2026-10-24T10:01:00Z",
      errorMessage,
    },
  } satisfies CoreSourceItem;
}

function renderBackup(source: CoreSourceItem) {
  return renderToStaticMarkup(
    <BackupIssueDialog
      source={source}
      onOpenChange={vi.fn()}
      onViewLogs={vi.fn()}
      finalFocus={{ current: null }}
    />,
  );
}

describe("backup details without saved file errors", () => {
  it("explains a failed backup with no error message or count", () => {
    expect(renderBackup(backupSource("FAILED"))).toContain(
      "folder.backupError.dialog.unavailable",
    );
  });

  it("shows the saved failure message when it is the only detail", () => {
    const markup = renderBackup(
      backupSource("FAILED", "repository unavailable"),
    );
    expect(markup).toContain("repository unavailable");
    expect(markup).not.toContain("folder.backupError.dialog.unavailable");
  });

  it("explains a partial backup without file details", () => {
    expect(renderBackup(backupSource("PARTIAL"))).toContain(
      "folder.backupError.dialog.unavailable",
    );
  });
});

describe("task log request states", () => {
  beforeEach(() => {
    queryState.taskError = false;
    queryState.logsError = false;
    queryState.logs = undefined;
    queryState.status = "SUCCESS";
  });

  it("shows unavailable when only the log request fails", () => {
    queryState.logsError = true;
    const markup = renderToStaticMarkup(<TaskDialog />);
    expect(markup).toContain("task.dialog.logs.unavailable");
    expect(markup).not.toContain("task.dialog.logs.empty");
  });

  it("shows unavailable when the task has expired", () => {
    queryState.taskError = true;
    expect(renderToStaticMarkup(<TaskDialog />)).toContain(
      "task.dialog.logs.unavailable",
    );
  });

  it("distinguishes a successful empty result from a failed request", () => {
    queryState.logs = [];
    const markup = renderToStaticMarkup(<TaskDialog />);
    expect(markup).toContain("task.dialog.logs.empty");
    expect(markup).not.toContain("task.dialog.logs.unavailable");
  });

  it("waits for logs while the task is running", () => {
    queryState.status = "RUNNING";
    expect(renderToStaticMarkup(<TaskDialog />)).toContain(
      "task.dialog.logs.waiting",
    );
  });

  it("keeps previously loaded logs visible after a failed refresh", () => {
    queryState.logsError = true;
    queryState.logs = [
      { level: 1, ts: 0, mod: "upload", msg: "Previously loaded log" },
    ];
    const markup = renderToStaticMarkup(<TaskDialog />);
    expect(markup).toContain("Previously loaded log");
    expect(markup).not.toContain("task.dialog.logs.unavailable");
  });
});
