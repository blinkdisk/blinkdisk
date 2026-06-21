import { useAppTranslation } from "@blinkdisk/hooks/use-app-translation";
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
import { cn } from "@blinkdisk/utils/class";
import { Empty } from "@desktop/components/empty";
import { FolderList } from "@desktop/components/folders/list";
import { VaultStatCard } from "@desktop/components/vaults/stat-card";
import { useStartBackup } from "@desktop/hooks/mutations/core/use-start-backup";
import { useBackupList } from "@desktop/hooks/queries/core/use-backup-list";
import {
  type CoreFolderItem,
  useFolderList,
} from "@desktop/hooks/queries/core/use-folder-list";
import { useVaultDevices } from "@desktop/hooks/queries/core/use-vault-devices";
import type { VaultItem } from "@desktop/hooks/queries/use-vault";
import { useCreateFolderDialog } from "@desktop/hooks/state/use-create-folder-dialog";
import { useLocalProfile } from "@desktop/hooks/use-local-profile";
import type { SelectedProfile } from "@desktop/hooks/use-profile";
import { formatCompactInt, formatSize } from "@desktop/lib/number";
import {
  getOtherProfiles,
  isSameProfile,
  matchesProfileListFilters,
  type ProfileListFilters,
  profileFromParts,
} from "@desktop/lib/profile";
import {
  buildVaultStatHistory,
  buildVaultStats,
} from "@desktop/lib/vault-stats";
import { useNavigate, useSearch } from "@tanstack/react-router";
import {
  CheckIcon,
  ChevronDownIcon,
  CloudUploadIcon,
  FolderPlusIcon,
  MonitorIcon,
  PlusIcon,
  UserIcon,
  XIcon,
} from "lucide-react";
import { Fragment, useCallback, useMemo } from "react";

type VaultOverviewProps = {
  vault?: VaultItem;
};

export function VaultOverview({ vault }: VaultOverviewProps) {
  const { t } = useAppTranslation("vault.overview");

  const navigate = useNavigate({ from: "/{-$accountId}/{-$vaultId}" });
  const { otherHostName, otherUserName } =
    useSearch({
      from: "/{-$accountId}/{-$vaultId}",
      shouldThrow: false,
    }) ?? {};
  const { openCreateFolder } = useCreateFolderDialog();
  const { localHostName, localUserName } = useLocalProfile();

  const localProfile = useMemo(
    () =>
      profileFromParts({
        hostName: localHostName,
        userName: localUserName,
      }),
    [localHostName, localUserName],
  );

  const { data: devices } = useVaultDevices();
  const otherProfiles = useMemo(
    () => getOtherProfiles(devices, localProfile),
    [devices, localProfile],
  );

  const otherProfileListFilters = useMemo<ProfileListFilters>(
    () => ({
      deviceName: otherHostName || null,
      userName: otherUserName || null,
    }),
    [otherHostName, otherUserName],
  );

  const setOtherProfileListFilters = useCallback(
    (filters: ProfileListFilters) => {
      navigate({
        search: (search) => ({
          ...search,
          otherHostName: filters.deviceName || undefined,
          otherUserName: filters.userName || undefined,
        }),
      });
    },
    [navigate],
  );

  const { mutate: startBackup, isPending: isStartingBackup } = useStartBackup({
    profile: localProfile,
  });
  const { data: currentFolders } = useFolderList({
    profile: localProfile,
  });
  const { data: allFolders } = useFolderList({ unfiltered: true });
  const { data: backups } = useBackupList({ filters: "none" });

  const otherProfileFolders = useMemo(() => {
    if (!allFolders || !localProfile) return undefined;

    return allFolders.filter((folder) => {
      const profile = {
        deviceName: folder.source.host,
        userName: folder.source.userName,
      };

      return !isSameProfile(profile, localProfile);
    });
  }, [allFolders, localProfile]);

  const otherFolders = useMemo(
    () =>
      otherProfileFolders?.filter((folder) =>
        matchesProfileListFilters({
          profile: {
            deviceName: folder.source.host,
            userName: folder.source.userName,
          },
          filters: otherProfileListFilters,
        }),
      ),
    [otherProfileFolders, otherProfileListFilters],
  );

  const isAnyBackupRunning = useMemo(
    () =>
      currentFolders?.some(
        (folder) =>
          folder.status === "UPLOADING" || folder.status === "PENDING",
      ),
    [currentFolders],
  );

  const stats = useMemo(() => {
    if (!allFolders) return null;

    return buildVaultStats(allFolders);
  }, [allFolders]);

  const statHistory = useMemo(() => {
    if (!backups) return null;

    return buildVaultStatHistory(backups);
  }, [backups]);

  const isStatsLoading = !vault || !stats || !statHistory;
  const isCurrentFoldersLoading = currentFolders === undefined;
  const isOverviewEmpty =
    Array.isArray(currentFolders) &&
    currentFolders.length === 0 &&
    Array.isArray(otherProfileFolders) &&
    otherProfileFolders.length === 0;

  return (
    <div
      className={cn(
        "flex min-h-full flex-col overflow-x-hidden p-6",
        currentFolders !== undefined ? "overflow-y-auto" : "overflow-hidden",
      )}
    >
      <div className="grid grid-cols-3 gap-6">
        <VaultStatCard
          title={t("stats.totalSize")}
          value={stats ? formatSize(stats.totalSize) : undefined}
          history={statHistory?.totalSize}
          isLoading={isStatsLoading}
        />
        <VaultStatCard
          title={t("stats.files")}
          value={stats ? formatCompactInt(stats.fileCount) : undefined}
          history={statHistory?.fileCount}
          isLoading={isStatsLoading}
        />
        <VaultStatCard
          title={t("stats.directories")}
          value={stats ? formatCompactInt(stats.directoryCount) : undefined}
          history={statHistory?.directoryCount}
          isLoading={isStatsLoading}
        />
      </div>
      <FolderSection
        title={t("currentProfile.title")}
        count={currentFolders?.length}
        folders={currentFolders}
        profile={localProfile}
        actions={
          isCurrentFoldersLoading ? (
            <>
              <Skeleton width="8rem" height="2.75rem" />
              <Skeleton width="11rem" height="2.75rem" />
            </>
          ) : (
            <>
              {currentFolders && currentFolders.length > 0 ? (
                <Button
                  onClick={() => startBackup({})}
                  loading={isStartingBackup || isAnyBackupRunning}
                  disabled={!localProfile}
                  variant="secondary"
                >
                  <CloudUploadIcon />
                  {t("folders.backupAll")}
                </Button>
              ) : null}
              <Button onClick={() => openCreateFolder()}>
                <PlusIcon />
                {t("folders.addFolder")}
              </Button>
            </>
          )
        }
        empty={
          currentFolders !== undefined
            ? {
                icon: <FolderPlusIcon />,
                title: t("folders.empty.title"),
                description: t("folders.empty.description"),
                children: (
                  <Button onClick={() => openCreateFolder()} size="lg">
                    <PlusIcon />
                    {t("folders.addFolder")}
                  </Button>
                ),
              }
            : undefined
        }
        fillAvailableSpace={isOverviewEmpty}
      />
      {otherProfiles.length > 0 && !isOverviewEmpty ? (
        <FolderSection
          title={t("otherProfiles.title")}
          count={otherFolders?.length}
          folders={otherFolders}
          profile={null}
          allowBackupActions={false}
          actions={
            <ProfileSelects
              profiles={otherProfiles}
              value={otherProfileListFilters}
              onChange={setOtherProfileListFilters}
            />
          }
          empty={
            otherFolders !== undefined
              ? {
                  icon: <FolderPlusIcon />,
                  title: t("otherProfiles.empty.title"),
                  description: t("otherProfiles.empty.description"),
                  containerClassName: "mt-8",
                }
              : undefined
          }
        />
      ) : null}
    </div>
  );
}

type FolderSectionProps = {
  title: string;
  count?: number;
  folders: CoreFolderItem[] | null | undefined;
  profile?: SelectedProfile;
  allowBackupActions?: boolean;
  actions?: React.ReactNode;
  fillAvailableSpace?: boolean;
  empty?: {
    icon: React.ReactNode;
    title: string;
    description: string;
    containerClassName?: string;
    children?: React.ReactNode;
  };
};

function FolderSection({
  title,
  count,
  folders,
  profile,
  allowBackupActions,
  actions,
  fillAvailableSpace,
  empty,
}: FolderSectionProps) {
  const { t } = useAppTranslation("vault.overview");

  return (
    <section
      className={cn(
        "mt-8",
        fillAvailableSpace && "flex min-h-0 flex-1 flex-col",
      )}
    >
      <div className="flex items-center justify-between gap-4">
        <div className="flex min-w-0 flex-col">
          <h2 className="truncate text-xl font-semibold">
            {folders !== undefined ? title : <Skeleton width={120} />}
          </h2>
          <p className="text-muted-foreground text-xs">
            {folders !== undefined && count !== undefined ? (
              t("folders.count", { count })
            ) : (
              <Skeleton width={120} />
            )}
          </p>
        </div>
        {actions ? (
          <div className="flex items-center gap-3">{actions}</div>
        ) : null}
      </div>
      {folders !== null && folders !== undefined && !folders.length && empty ? (
        <Empty
          icon={empty.icon}
          title={empty.title}
          description={empty.description}
          containerClassName={cn(
            empty.containerClassName,
            fillAvailableSpace && "flex-1",
          )}
        >
          {empty.children}
        </Empty>
      ) : (
        <FolderList
          folders={folders}
          profile={profile}
          allowBackupActions={allowBackupActions}
        />
      )}
    </section>
  );
}

type ProfileSelectsProps = {
  profiles: ReturnType<typeof getOtherProfiles>;
  value: ProfileListFilters;
  onChange: (filters: ProfileListFilters) => void;
};

function ProfileSelects({ profiles, value, onChange }: ProfileSelectsProps) {
  const { t } = useAppTranslation("vault.overview.otherProfiles.select");

  const isFiltered = !!value.deviceName || !!value.userName;
  const selectedLabel =
    value.deviceName && value.userName
      ? `${value.deviceName} / ${value.userName}`
      : value.deviceName || value.userName || t("all");
  const TriggerIcon = value.userName ? UserIcon : MonitorIcon;

  return (
    <DropdownMenu>
      <div className="relative">
        <DropdownMenuTrigger
          className={cn(
            "border-input bg-card hover:bg-card-hover flex h-11 w-64 select-none items-center justify-between gap-1.5 whitespace-nowrap rounded-lg border py-2 pl-3 pr-3 text-sm outline-none transition-colors focus:z-10",
          )}
        >
          <div
            className={cn(
              "flex min-w-0 items-center gap-2.5",
              isFiltered && "pr-6",
            )}
          >
            <TriggerIcon className="size-4.25 shrink-0" />
            <span className="truncate">{selectedLabel}</span>
          </div>
          {!isFiltered ? (
            <ChevronDownIcon className="text-muted-foreground pointer-events-none size-4 shrink-0" />
          ) : null}
        </DropdownMenuTrigger>
        {isFiltered ? (
          <button
            type="button"
            aria-label={t("clear")}
            title={t("clear")}
            onClick={(event) => {
              event.preventDefault();
              event.stopPropagation();

              onChange({
                deviceName: null,
                userName: null,
              });
            }}
            className="text-muted-foreground hover:bg-accent hover:text-foreground focus-visible:ring-ring absolute right-2 top-1/2 z-10 flex size-5 -translate-y-1/2 items-center justify-center rounded-sm outline-none transition-colors focus-visible:ring-2"
          >
            <XIcon className="size-3.5" />
          </button>
        ) : null}
      </div>
      <DropdownMenuContent align="end" className="w-64">
        <DropdownMenuGroup>
          <DropdownMenuItem
            onClick={() => {
              onChange({
                deviceName: null,
                userName: null,
              });
            }}
            className="justify-between"
          >
            <span className="flex min-w-0 items-center gap-2">
              <MonitorIcon className="size-4 shrink-0" />
              <span className="truncate">{t("all")}</span>
            </span>
            {!isFiltered ? (
              <CheckIcon className="text-primary ml-auto size-4" />
            ) : null}
          </DropdownMenuItem>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          {profiles.map((device, index) => {
            const isDeviceSelected =
              value.deviceName === device.hostName && !value.userName;

            return (
              <Fragment key={device.hostName}>
                {index > 0 ? <DropdownMenuSeparator /> : null}
                <DropdownMenuItem
                  onClick={() => {
                    onChange({
                      deviceName: device.hostName,
                      userName: null,
                    });
                  }}
                  className="justify-between font-medium"
                >
                  <span className="flex min-w-0 items-center gap-2">
                    <MonitorIcon className="size-4 shrink-0" />
                    <span className="truncate">{device.hostName}</span>
                  </span>
                  {isDeviceSelected ? (
                    <CheckIcon className="text-primary ml-auto size-4" />
                  ) : null}
                </DropdownMenuItem>
                {device.users.map(({ userName }) => {
                  const isUserSelected =
                    value.deviceName === device.hostName &&
                    value.userName === userName;

                  return (
                    <DropdownMenuItem
                      key={`${device.hostName}:${userName}`}
                      onClick={() => {
                        onChange({
                          deviceName: device.hostName,
                          userName,
                        });
                      }}
                      className="justify-between pl-8"
                    >
                      <span className="flex min-w-0 items-center gap-2">
                        <UserIcon className="text-muted-foreground size-4 shrink-0" />
                        <span className="truncate">{userName}</span>
                      </span>
                      {isUserSelected ? (
                        <CheckIcon className="text-primary ml-auto size-4" />
                      ) : null}
                    </DropdownMenuItem>
                  );
                })}
              </Fragment>
            );
          })}
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
