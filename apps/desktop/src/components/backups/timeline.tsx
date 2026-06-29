import { useAppTranslation } from "@blinkdisk/hooks/use-app-translation";
import {
  isFileLikeSource,
  type KopiaEntryType,
  sourceTypeFromKopiaEntryType,
} from "@blinkdisk/schemas/source";
import { Button } from "@blinkdisk/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@blinkdisk/ui/dropdown-menu";
import { Skeleton } from "@blinkdisk/ui/skeleton";
import { cn } from "@blinkdisk/utils/class";
import { PinBadge } from "@desktop/components/backups/pin-badge";
import { BackupProgress } from "@desktop/components/backups/progress";
import { LocalButton } from "@desktop/components/vaults/local-button";
import { useStartBackup } from "@desktop/hooks/mutations/core/use-start-backup";
import { useStartRestore } from "@desktop/hooks/mutations/core/use-start-restore";
import type { DirectoryItem } from "@desktop/hooks/queries/core/use-directory";
import { useDeleteBackupDialog } from "@desktop/hooks/state/use-delete-backup-dialog";
import { usePinBackupDialog } from "@desktop/hooks/state/use-pin-backup-dialog";
import { useRenameBackupDialog } from "@desktop/hooks/state/use-rename-backup-dialog";
import { useRelativeTime } from "@desktop/hooks/use-relative-time";
import { useSource } from "@desktop/hooks/use-source";
import { formatBackupDate } from "@desktop/lib/backup";
import { formatSize } from "@desktop/lib/number";
import { Link } from "@tanstack/react-router";
import {
  CalendarClockIcon,
  CalendarIcon,
  CloudDownloadIcon,
  FileSearchIcon,
  FilesIcon,
  HardDriveIcon,
  MoreVerticalIcon,
  PenLineIcon,
  PinIcon,
  PlayIcon,
  TrashIcon,
} from "lucide-react";
import { useMemo } from "react";

interface Backup {
  id: string;
  description: string;
  startTime: string;
  rootID: string;
  rootEntryType?: KopiaEntryType;
  pins: string[];
  summary: {
    size: number;
    files: number;
    symlinks?: number;
  };
}

interface BackupTimelineProps {
  backups: Backup[] | undefined;
}

type FakeBackupType = {
  type: "FAKE";
  startTime: string;
};

function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString(undefined, {
    dateStyle: "medium",
  });
}

export function BackupTimeline({ backups }: BackupTimelineProps) {
  const { data: folder } = useSource();

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
      (folder?.lastSnapshot &&
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
      <div className="border-input bottom-22 absolute top-0 border-l-2" />

      <div className="space-y-8">
        {groupedBackups.map(([dateKey, dayBackups]) => (
          <div key={dateKey} className="relative">
            <div className="mb-4 flex items-center gap-3">
              <div className="border-input h-0 w-6 border-b-2"></div>
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
                      "border-input left-2 w-8 rounded-bl-full border-2 border-r-0 border-t-0",
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
  "transition-colors relative bg-card flex w-full flex-row items-center justify-between gap-2 rounded-2xl border p-5 focus-visible:ring-2 outline-none ring-ring";

function FakeBackup() {
  const { t } = useAppTranslation("backup.list");
  const { data: folder } = useSource();

  const { mutate: startBackup, isPending: isStartingBackup } = useStartBackup();

  return (
    <div
      className={cn(
        cardClassName,
        "h-19 relative overflow-hidden bg-transparent",
      )}
    >
      {folder && folder.status === "PENDING" ? (
        <div className="flex items-center gap-4">
          <CalendarClockIcon className="text-muted-foreground size-6" />
          <div className="flex flex-col">
            <p className="font-medium">{t("pending.title")}</p>
            <p className="text-muted-foreground text-xs">
              {t("pending.description")}
            </p>
          </div>
        </div>
      ) : folder && folder.status === "UPLOADING" ? (
        <>
          {folder.upload?.progress ? (
            <div
              style={{
                width: `${((folder.upload?.progress || 0) * 100).toFixed(0)}%`,
              }}
              className={cn(
                "bg-foreground/5 dark:bg-foreground/10 absolute bottom-0 left-0 top-0 transition-all",
              )}
            ></div>
          ) : null}
          <BackupProgress upload={folder.upload} />
        </>
      ) : (
        <>
          <div className="flex flex-col">
            <p className="font-medium">{t("paused.title")}</p>
            <p className="text-muted-foreground -mt-0.5 text-xs">
              {t("paused.description")}
            </p>
          </div>
          <LocalButton
            variant="secondary"
            onClick={() => folder && startBackup({ path: folder.source.path })}
            loading={
              isStartingBackup ||
              ["UPLOADING", "PENDING"].includes(folder?.status || "")
            }
          >
            <PlayIcon />
            {t("paused.button")}
          </LocalButton>
        </>
      )}
    </div>
  );
}

type BackupProps = {
  backup: Backup | undefined;
};

function Backup({ backup }: BackupProps) {
  const { t } = useAppTranslation("backup.list.item");
  const { data: source } = useSource();
  const { openDeleteBackupDialog } = useDeleteBackupDialog();
  const { openPinBackupDialog } = usePinBackupDialog();
  const { openRenameBackupDialog } = useRenameBackupDialog();
  const { mutate: startRestore } = useStartRestore();

  const formattedTime = useRelativeTime(backup ? backup.startTime : 0);
  const backupSourceType =
    sourceTypeFromKopiaEntryType(backup?.rootEntryType) ||
    source?.type ||
    "directory";
  const isFileLikeBackup = isFileLikeSource(backupSourceType);
  const fileCount =
    (backup?.summary?.files || 0) + (backup?.summary?.symlinks || 0);

  const restoreRootBackup = async () => {
    if (!backup?.rootID || !source) return;

    const name = await window.electron.path.basename(source.source.path);
    const item: DirectoryItem = {
      id: `${backup.rootID}:${name}`,
      objectId: backup.rootID,
      name,
      type: backupSourceType === "symlink" ? "SYMLINK" : "FILE",
      meta: { mode: "", uid: 0, gid: 0 },
      stats: { size: backup.summary?.size || 0 },
      modifiedAt: backup.startTime,
    };

    startRestore({ variant: "single", item });
  };

  return (
    <div className={cn(cardClassName, "hover:bg-card-hover")}>
      {backup?.id && backup.rootID && !isFileLikeBackup ? (
        <Link
          to="/$accountId/$vaultId/$sourceId/$backupId/$directoryId"
          from="/$accountId/$vaultId/$sourceId/"
          params={(params) => ({
            ...params,
            backupId: backup.id,
            directoryId: backup.rootID,
          })}
          className="absolute inset-0"
        />
      ) : backup?.id && backup.rootID ? (
        <button
          type="button"
          onClick={restoreRootBackup}
          className="absolute inset-0"
          aria-label={t("dropdown.restoreFile")}
        />
      ) : null}
      <div className="flex flex-col">
        <div className="flex items-center gap-2">
          <p className="text-lg font-semibold">
            {backup ? (
              formattedTime?.replace("about ", "~ ")
            ) : (
              <Skeleton width={100} />
            )}
          </p>
          {backup?.description ? (
            <p className="text-primary whitespace-pre font-medium">
              {backup.description}
            </p>
          ) : null}
        </div>
        <p className="text-muted-foreground text-sm">
          <CalendarIcon className="mr-2 inline-block size-4" />
          {backup ? formatBackupDate(backup) : <Skeleton width={150} />}
        </p>
      </div>
      <div className="flex items-center gap-3">
        <div className="flex flex-col items-end gap-2">
          {backup && backup.pins.length > 0 && (
            <div className="z-10 flex flex-wrap justify-end gap-1.5">
              {backup.pins.map((pin) => (
                <PinBadge key={pin} pin={pin} size="sm" />
              ))}
            </div>
          )}
          <div className="text-muted-foreground flex items-center gap-4 text-sm">
            <div className="flex items-center gap-1.5">
              {backup ? <FilesIcon className="size-4" /> : null}
              <span>
                {backup ? (
                  t("files", {
                    count: fileCount,
                    formatted: fileCount.toLocaleString(),
                  })
                ) : (
                  <Skeleton width={70} />
                )}
              </span>
            </div>
            <div className="flex items-center gap-1.5">
              {backup ? <HardDriveIcon className="size-4" /> : null}
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
        <div className="h-6 border-r" />
        {backup ? (
          <DropdownMenu>
            <DropdownMenuTrigger
              render={
                <Button
                  size="icon-sm"
                  className="[&_svg]:size-5"
                  variant="ghost"
                >
                  <MoreVerticalIcon />
                </Button>
              }
            />
            <DropdownMenuContent className="w-48" align="end">
              {backup.id && backup.rootID && !isFileLikeBackup ? (
                <DropdownMenuItem
                  render={
                    <Link
                      to="/$accountId/$vaultId/$sourceId/$backupId/$directoryId"
                      from="/$accountId/$vaultId/$sourceId/"
                      params={(params) => ({
                        ...params,
                        backupId: backup.id,
                        directoryId: backup.rootID,
                      })}
                    >
                      <FileSearchIcon />
                      {t("dropdown.browse")}
                    </Link>
                  }
                />
              ) : backup.id && backup.rootID ? (
                <DropdownMenuItem onClick={restoreRootBackup}>
                  <CloudDownloadIcon />
                  {t("dropdown.restoreFile")}
                </DropdownMenuItem>
              ) : null}
              <DropdownMenuItem
                onClick={() =>
                  openRenameBackupDialog({
                    backupId: backup.id,
                    currentName: backup.description,
                  })
                }
              >
                <PenLineIcon />
                {t("dropdown.rename")}
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() =>
                  openPinBackupDialog({
                    backupId: backup.id,
                    currentPins: backup.pins,
                  })
                }
              >
                <PinIcon />
                {t("dropdown.pin")}
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() =>
                  openDeleteBackupDialog({
                    backupId: backup.id,
                  })
                }
                variant="destructive"
              >
                <TrashIcon />
                {t("dropdown.delete")}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        ) : (
          <Skeleton width="1.25rem" height="1.25rem" />
        )}
      </div>
    </div>
  );
}
