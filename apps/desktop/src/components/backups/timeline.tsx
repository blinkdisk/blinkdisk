import { BackupProgress } from "@desktop/components/backups/progress";
import { MutatingButton } from "@desktop/components/vaults/mutating-button";
import { useBackupFolder } from "@desktop/hooks/mutations/core/use-backup-folder";
import { useFolder } from "@desktop/hooks/use-folder";
import { useRelativeTime } from "@desktop/hooks/use-relative-time";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@ui/dropdown-menu";

import { MutatingDropdownMenuItem } from "@desktop/components/vaults/mutating-dropdown-item";
import { useDeleteBackupDialog } from "@desktop/hooks/state/use-delete-backup-dialog";
import { formatSize } from "@desktop/lib/number";
import { useAppTranslation } from "@hooks/use-app-translation";
import { Link } from "@tanstack/react-router";
import { Button } from "@ui/button";
import { Skeleton } from "@ui/skeleton";
import { cn } from "@utils/class";
import {
  CalendarClockIcon,
  FileSearchIcon,
  FilesIcon,
  HardDrive,
  MoreVerticalIcon,
  PlayIcon,
  TrashIcon,
} from "lucide-react";
import { useMemo } from "react";

interface Backup {
  id: string;
  startTime: string;
  rootID: string;
  summary: {
    size: number;
    files: number;
  };
}

interface BackupTimelineProps {
  backups: Backup[] | undefined;
}

type FakeBackupType = {
  type: "FAKE";
  startTime: string;
};

function formatDateTime(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleString(undefined, {
    timeStyle: "short",
    dateStyle: "short",
  });
}

function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString(undefined, {
    dateStyle: "medium",
  });
}

export function BackupTimeline({ backups }: BackupTimelineProps) {
  const { data: folder } = useFolder();

  const groupedBackups = useMemo(() => {
    if (!backups)
      return [
        ["1", [undefined, undefined]],
        ["2", [undefined]],
        ["3", [undefined, undefined]],
        ["4", [undefined]],
        ["5", [undefined, undefined]],
        ["6", [undefined]],
        ["7", [undefined, undefined]],
      ] as const;

    const groups: {
      [key: string]: (Backup | FakeBackupType | undefined)[];
    } = {};

    const backupsWithFake: (Backup | FakeBackupType)[] = [...backups];

    if (
      ["PENDING", "UPLOADING"].includes(folder?.status || "") ||
      (folder &&
        folder.lastSnapshot &&
        "incomplete" in folder.lastSnapshot &&
        folder?.lastSnapshot?.incomplete === "checkpoint")
    ) {
      backupsWithFake.push({
        type: "FAKE",
        startTime: new Date().toISOString(),
      });
    }

    backupsWithFake.forEach((backup) => {
      const dateKey = backup ? new Date(backup.startTime).toDateString() : "-";
      if (!groups[dateKey]) {
        groups[dateKey] = [];
      }
      groups[dateKey].push(backup);
    });

    const sortedGroups = Object.entries(groups).sort(
      ([a], [b]) => new Date(b).getTime() - new Date(a).getTime(),
    );

    sortedGroups.forEach(([, backups]) => {
      backups.sort((a, b) =>
        a && b
          ? new Date(b.startTime).getTime() - new Date(a.startTime).getTime()
          : 0,
      );
    });

    return sortedGroups;
  }, [folder, backups]);

  return (
    <div className="relative">
      <div className="dark:border-input bottom-22 absolute top-0 border-l-2" />

      <div className="space-y-8">
        {groupedBackups.map(([dateKey, dayBackups]) => (
          <div key={dateKey} className="relative">
            <div className="mb-4 flex items-center gap-3">
              <div className="dark:border-input h-0 w-6 border-b-2"></div>
              <p className="text-muted-foreground text-lg">
                {dayBackups[0] ? (
                  formatDate(dayBackups[0]?.startTime || "")
                ) : (
                  <Skeleton width={150} />
                )}
              </p>
            </div>

            <div className="space-y-4">
              {dayBackups.map((backup, index) => (
                <div
                  key={
                    backup
                      ? "type" in backup && backup.type === "FAKE"
                        ? "FAKE"
                        : "id" in backup
                          ? backup.id
                          : ""
                      : index
                  }
                  className="relative flex"
                >
                  <div
                    className={cn(
                      "dark:border-input left-2 w-8 rounded-bl-full border-2 border-r-0 border-t-0",
                      backup && "type" in backup && backup?.type === "FAKE"
                        ? "h-10"
                        : "h-12",
                    )}
                  ></div>

                  <div className="flex-1">
                    {backup && "type" in backup && backup?.type === "FAKE" ? (
                      <FakeBackup key="FAKE" />
                    ) : (
                      <Backup
                        key={backup ? (backup as Backup).id : index}
                        backup={backup as Backup}
                      />
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

const cardClassName =
  "relative bg-card flex w-full flex-row items-center justify-between gap-2 rounded-2xl border p-5 focus-visible:ring-2 outline-none ring-ring";

function FakeBackup() {
  const { t } = useAppTranslation("backup.list");
  const { data: folder } = useFolder();

  const { mutate: backup, isPending: isBackupLoading } = useBackupFolder();

  return (
    <div
      className={cn(
        cardClassName,
        "h-19 relative overflow-hidden bg-transparent",
      )}
    >
      {folder && folder.status === "PENDING" ? (
        <>
          <div className="flex items-center gap-4">
            <CalendarClockIcon className="text-muted-foreground size-6" />
            <div className="flex flex-col">
              <p className="font-medium">{t("pending.title")}</p>
              <p className="text-muted-foreground text-xs">
                {t("pending.description")}
              </p>
            </div>
          </div>
        </>
      ) : folder && folder.status === "UPLOADING" ? (
        <>
          <div
            style={{
              width: `${((folder.upload?.progress || 0) * 100).toFixed(0)}%`,
            }}
            className="bg-foreground/5 dark:bg-foreground/10 absolute bottom-0 left-0 top-0 transition-all"
          ></div>
          <BackupProgress upload={folder.upload} variant="descriptive" />
        </>
      ) : (
        <>
          <div className="flex flex-col">
            <p className="font-medium">{t("paused.title")}</p>
            <p className="text-muted-foreground -mt-0.5 text-xs">
              {t("paused.description")}
            </p>
          </div>
          <MutatingButton
            variant="outline"
            onClick={() => folder && backup({ path: folder.source.path })}
            loading={
              isBackupLoading ||
              ["UPLOADING", "PENDING"].includes(folder?.status || "")
            }
          >
            <PlayIcon />
            {t("paused.button")}
          </MutatingButton>
        </>
      )}
    </div>
  );
}

type BackupProps = {
  backup: Backup | undefined;
};

export function Backup({ backup }: BackupProps) {
  const { t } = useAppTranslation("backup.list.item");
  const { openDeleteBackupDialog } = useDeleteBackupDialog();

  const formattedTime = useRelativeTime(backup ? backup.startTime : 0);

  return (
    <div role="link" className={cn(cardClassName, "hover:bg-card-hover")}>
      <Link
        to="/app/{-$deviceId}/{-$profileId}/{-$vaultId}/{-$folderId}/{-$backupId}/{-$directoryId}"
        params={(params) => ({
          ...params,
          backupId: backup?.id || "",
          directoryId: backup && "rootID" in backup ? backup?.rootID : "",
        })}
        className="absolute inset-0"
      />
      <div className="flex flex-col">
        <p className="text-lg font-semibold">
          {backup ? formatDateTime(backup.startTime) : <Skeleton width={150} />}
        </p>

        <div className="text-muted-foreground flex items-center gap-4 text-sm">
          <div className="flex items-center gap-1.5">
            {backup ? <FilesIcon className="size-4" /> : null}
            <span>
              {backup ? (
                t("files", {
                  count: backup.summary?.files,
                  formatted: backup.summary?.files.toLocaleString(),
                })
              ) : (
                <Skeleton width={70} />
              )}
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            {backup ? <HardDrive className="size-4" /> : null}
            <span>
              {backup ? (
                formatSize(backup.summary.size)
              ) : (
                <Skeleton width={70} />
              )}
            </span>
          </div>
        </div>
      </div>
      <div className="flex items-center gap-3">
        <p className="text-muted-foreground text-sm">
          {backup ? formattedTime : <Skeleton width={100} />}
        </p>
        <div className="h-6 border-r" />
        {backup ? (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button size="icon-sm" className="[&_svg]:size-5" variant="ghost">
                <MoreVerticalIcon />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-48" align="end">
              <DropdownMenuItem asChild>
                <Link
                  to="/app/{-$deviceId}/{-$profileId}/{-$vaultId}/{-$folderId}/{-$backupId}/{-$directoryId}"
                  params={(params) => ({
                    ...params,
                    backupId: backup?.id || "",
                    directoryId:
                      backup && "rootID" in backup ? backup?.rootID : "",
                  })}
                >
                  <FileSearchIcon />
                  {t("dropdown.browse")}
                </Link>
              </DropdownMenuItem>
              <MutatingDropdownMenuItem
                onClick={() =>
                  openDeleteBackupDialog({
                    backupId: backup.id,
                  })
                }
                variant="destructive"
              >
                <TrashIcon />
                {t("dropdown.delete")}
              </MutatingDropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        ) : (
          <Skeleton width="1.25rem" height="1.25rem" />
        )}
      </div>
    </div>
  );
}
