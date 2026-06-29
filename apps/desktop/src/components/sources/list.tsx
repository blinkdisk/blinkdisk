import { useAppTranslation } from "@blinkdisk/hooks/use-app-translation";
import { isFileLikeSource } from "@blinkdisk/schemas/source";
import { Button } from "@blinkdisk/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@blinkdisk/ui/dropdown-menu";
import { Skeleton } from "@blinkdisk/ui/skeleton";
import { BackupProgress } from "@desktop/components/backups/progress";
import { SourcePreview } from "@desktop/components/sources/preview";
import { useCancelBackup } from "@desktop/hooks/mutations/core/use-cancel-backup";
import { useStartBackup } from "@desktop/hooks/mutations/core/use-start-backup";
import type { CoreSourceItem } from "@desktop/hooks/queries/core/use-source-list";
import { useDeleteSourceDialog } from "@desktop/hooks/state/use-delete-source-dialog";
import type { SelectedProfile } from "@desktop/hooks/use-profile";
import { useRelativeTime } from "@desktop/hooks/use-relative-time";
import { formatInt, formatSize } from "@desktop/lib/number";
import { policyTargetToSearch } from "@desktop/lib/policy-target";
import { Link, useNavigate } from "@tanstack/react-router";
import {
  CloudUploadIcon,
  FileCogIcon,
  FolderSearchIcon,
  MoreVerticalIcon,
  SquareIcon,
  TrashIcon,
} from "lucide-react";
import { useMemo } from "react";

type SourceListProps = {
  sources: CoreSourceItem[] | undefined | null;
  profile?: SelectedProfile;
  allowBackupActions?: boolean;
};

export function SourceList({
  sources,
  profile,
  allowBackupActions = true,
}: SourceListProps) {
  return (
    <div className="mt-6 flex flex-col gap-3">
      {(sources === undefined || sources === null
        ? (new Array(20).fill(undefined) as undefined[])
        : sources
      ).map((source, index) => (
        <Source
          key={source ? source.id : index}
          source={source}
          profile={profile}
          allowBackupActions={allowBackupActions}
        />
      ))}
    </div>
  );
}

type SourceProps = {
  source: CoreSourceItem | undefined;
  profile?: SelectedProfile;
  allowBackupActions: boolean;
};

function Source({ source, profile, allowBackupActions }: SourceProps) {
  const { t } = useAppTranslation("folder.list.item");
  const formattedTime = useRelativeTime(source?.lastSnapshot?.startTime);
  const sourceTypeKey = isFileLikeSource(source?.type) ? "file" : "folder";

  const { mutate: startBackup } = useStartBackup({ profile });
  const { mutate: cancelBackup } = useCancelBackup({ profile });
  const { openDeleteSourceDialog } = useDeleteSourceDialog();
  const navigate = useNavigate({ from: "/$accountId/$vaultId" });

  const showProgress = useMemo(
    () =>
      source &&
      source.status === "UPLOADING" &&
      source.currentTaskStatus !== "CANCELING",
    [source],
  );

  const showStartTime = useMemo(
    () => source?.lastSnapshot && !source.lastSnapshot.incomplete,
    [source],
  );

  const sourceSelectedProfile: SelectedProfile | undefined = source
    ? {
        deviceName: source.source.host,
        userName: source.source.userName,
      }
    : profile;

  const sourceRouteParams = (params: {
    accountId?: string;
    vaultId: string;
  }) => ({
    ...params,
    sourceId: source?.id || "",
  });

  return (
    <div className="bg-card hover:bg-card-hover ring-ring relative flex flex-row items-center justify-between gap-2 rounded-2xl border p-4 outline-none transition-colors focus-visible:ring-2">
      {source && sourceRouteParams ? (
        <Link
          to="/$accountId/$vaultId/$sourceId"
          from="/$accountId/$vaultId"
          params={sourceRouteParams}
          className="absolute inset-0"
        />
      ) : null}
      <SourcePreview source={source} />
      <div className="flex items-center gap-3">
        {showStartTime || showProgress ? (
          <>
            {showProgress && source ? (
              <BackupProgress upload={source.upload} size="sm" />
            ) : showStartTime ? (
              <div className="flex flex-col items-end gap-0.5">
                <p className="text-foreground whitespace-nowrap text-sm">
                  {source ? formattedTime : <Skeleton width={100} />}
                </p>
                {source?.lastSnapshot ? (
                  <p className="text-muted-foreground whitespace-nowrap text-xs">
                    {t("stats", {
                      fileCount: formatInt(
                        (source.lastSnapshot.stats?.cachedFiles || 0) +
                          (source.lastSnapshot.stats?.nonCachedFiles || 0),
                      ),
                      size: formatSize(
                        source.lastSnapshot.stats?.totalSize || 0,
                      ),
                    })}
                  </p>
                ) : null}
              </div>
            ) : null}
            <div className={showStartTime ? "h-8 border-r" : "h-6 border-r"} />
          </>
        ) : null}
        {source ? (
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
              <DropdownMenuItem
                render={
                  <Link
                    to="/$accountId/$vaultId/$sourceId"
                    from="/$accountId/$vaultId"
                    params={sourceRouteParams}
                  >
                    <FolderSearchIcon />
                    {t("dropdown.browse")}
                  </Link>
                }
              />
              <DropdownMenuSeparator />
              <DropdownMenuGroup>
                {allowBackupActions &&
                source.status === "UPLOADING" &&
                source.currentTaskStatus !== "CANCELING" ? (
                  <DropdownMenuItem
                    onClick={() => cancelBackup({ taskId: source.currentTask })}
                  >
                    <SquareIcon />
                    {t("dropdown.cancel")}
                  </DropdownMenuItem>
                ) : allowBackupActions &&
                  ["IDLE", "REMOTE"].includes(source.status) ? (
                  <DropdownMenuItem
                    onClick={() => startBackup({ path: source.source.path })}
                  >
                    <CloudUploadIcon />
                    {t(`dropdown.backup.${sourceTypeKey}`)}
                  </DropdownMenuItem>
                ) : null}
                <DropdownMenuItem
                  onClick={() =>
                    navigate({
                      to: "/$accountId/$vaultId/policies",
                      search: policyTargetToSearch({
                        kind: "SOURCE",
                        hostName: source.source.host,
                        userName: source.source.userName,
                        path: source.source.path,
                      }),
                    })
                  }
                >
                  <FileCogIcon />
                  {t(`dropdown.settings.${sourceTypeKey}`)}
                </DropdownMenuItem>
              </DropdownMenuGroup>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() =>
                  openDeleteSourceDialog({
                    sourceId: source.id,
                    profile: sourceSelectedProfile,
                  })
                }
                variant="destructive"
              >
                <TrashIcon />
                {t(`dropdown.delete.${sourceTypeKey}`)}
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
