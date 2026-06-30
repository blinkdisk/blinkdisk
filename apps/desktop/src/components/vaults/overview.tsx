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
import { SourceList } from "@desktop/components/sources/list";
import { VaultStatCard } from "@desktop/components/vaults/stat-card";
import { useStartBackup } from "@desktop/hooks/mutations/core/use-start-backup";
import { useBackupList } from "@desktop/hooks/queries/core/use-backup-list";
import {
  type CoreSourceItem,
  useSourceList,
} from "@desktop/hooks/queries/core/use-source-list";
import { useVaultDevices } from "@desktop/hooks/queries/core/use-vault-devices";
import type { VaultItem } from "@desktop/hooks/queries/use-vault";
import { useCreateSourceDialog } from "@desktop/hooks/state/use-create-source-dialog";
import { useLocalProfile } from "@desktop/hooks/use-local-profile";
import type { SelectedProfile } from "@desktop/hooks/use-profile";
import { formatCompactInt, formatSize } from "@desktop/lib/number";
import {
  getOtherProfiles,
  hasMultipleProfileUsers,
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
import { Fragment } from "react";

type VaultOverviewProps = {
  vault?: VaultItem;
};

export function VaultOverview({ vault }: VaultOverviewProps) {
  const { t } = useAppTranslation("vault.overview");

  const navigate = useNavigate({ from: "/$accountId/$vaultId" });
  const { otherHostName, otherUserName } =
    useSearch({
      from: "/$accountId/$vaultId",
      shouldThrow: false,
    }) ?? {};
  const { openCreateSource } = useCreateSourceDialog();
  const { localHostName, localUserName } = useLocalProfile();

  const localProfile = profileFromParts({
    hostName: localHostName,
    userName: localUserName,
  });

  const { data: devices } = useVaultDevices();
  const otherProfiles = getOtherProfiles(devices, localProfile);

  const otherProfileListFilters = {
    deviceName: otherHostName || null,
    userName: otherUserName || null,
  };

  const setOtherProfileListFilters = (filters: ProfileListFilters) => {
    navigate({
      search: (search) => ({
        ...search,
        otherHostName: filters.deviceName || undefined,
        otherUserName: filters.userName || undefined,
      }),
    });
  };

  const { mutate: startBackup, isPending: isStartingBackup } = useStartBackup({
    profile: localProfile,
  });
  const { data: currentSources } = useSourceList({
    profile: localProfile,
  });
  const { data: allSources } = useSourceList({ unfiltered: true });
  const { data: backups } = useBackupList({ filters: "none" });

  const otherProfileSources = (() => {
    if (!allSources || !localProfile) return undefined;

    return allSources.filter((source) => {
      const profile = {
        deviceName: source.source.host,
        userName: source.source.userName,
      };

      return !isSameProfile(profile, localProfile);
    });
  })();

  const otherSources = otherProfileSources?.filter((source) =>
    matchesProfileListFilters({
      profile: {
        deviceName: source.source.host,
        userName: source.source.userName,
      },
      filters: otherProfileListFilters,
    }),
  );

  const isAnyBackupRunning = currentSources?.some(
    (source) => source.status === "UPLOADING" || source.status === "PENDING",
  );

  const stats = (() => {
    if (!allSources) return null;

    return buildVaultStats(allSources);
  })();

  const statHistory = (() => {
    if (!backups) return null;

    return buildVaultStatHistory(backups);
  })();

  const isStatsLoading = !vault || !stats || !statHistory;
  const isCurrentSourcesLoading = currentSources === undefined;
  const isOverviewEmpty =
    Array.isArray(currentSources) &&
    currentSources.length === 0 &&
    Array.isArray(otherProfileSources) &&
    otherProfileSources.length === 0;

  return (
    <div
      className={cn(
        "flex min-h-full flex-col overflow-x-hidden p-6",
        currentSources !== undefined ? "overflow-y-auto" : "overflow-hidden",
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
      <SourceSection
        title={t("currentProfile.title")}
        count={currentSources?.length}
        sources={currentSources}
        profile={localProfile}
        actions={
          isCurrentSourcesLoading ? (
            <>
              <Skeleton width="8rem" height="2.75rem" />
              <Skeleton width="11rem" height="2.75rem" />
            </>
          ) : (
            <>
              {currentSources && currentSources.length > 0 ? (
                <Button
                  onClick={() => startBackup({})}
                  loading={isStartingBackup || isAnyBackupRunning}
                  disabled={!localProfile}
                  variant="secondary"
                >
                  <CloudUploadIcon />
                  {t("sources.backupAll")}
                </Button>
              ) : null}
              <Button onClick={() => openCreateSource()}>
                <PlusIcon />
                {t("sources.addSource")}
              </Button>
            </>
          )
        }
        empty={
          currentSources !== undefined
            ? {
                icon: <FolderPlusIcon />,
                title: t("sources.empty.title"),
                description: t("sources.empty.description"),
                children: (
                  <Button onClick={() => openCreateSource()} size="lg">
                    <PlusIcon />
                    {t("sources.addSource")}
                  </Button>
                ),
              }
            : undefined
        }
        fillAvailableSpace={isOverviewEmpty}
      />
      {otherProfiles.length > 0 && !isOverviewEmpty ? (
        <SourceSection
          title={t("otherProfiles.title")}
          count={otherSources?.length}
          sources={otherSources}
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
            otherSources !== undefined
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

type SourceSectionProps = {
  title: string;
  count?: number;
  sources: CoreSourceItem[] | null | undefined;
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

function SourceSection({
  title,
  count,
  sources,
  profile,
  allowBackupActions,
  actions,
  fillAvailableSpace,
  empty,
}: SourceSectionProps) {
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
            {sources !== undefined ? title : <Skeleton width={120} />}
          </h2>
          <p className="text-muted-foreground text-xs">
            {sources !== undefined && count !== undefined ? (
              t("sources.count", { count })
            ) : (
              <Skeleton width={120} />
            )}
          </p>
        </div>
        {actions ? (
          <div className="flex items-center gap-3">{actions}</div>
        ) : null}
      </div>
      {sources !== null && sources !== undefined && !sources.length && empty ? (
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
        <SourceList
          sources={sources}
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
            const showUsers = hasMultipleProfileUsers(device);
            const isDeviceSelected =
              value.deviceName === device.hostName &&
              (!value.userName || !showUsers);

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
                {showUsers
                  ? device.users.map(({ userName }) => {
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
                    })
                  : null}
              </Fragment>
            );
          })}
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
