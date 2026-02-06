import { Empty } from "@desktop/components/empty";
import { FolderList } from "@desktop/components/folders/list";
import { LocalButton } from "@desktop/components/vaults/local-button";
import { VaultTitlebar } from "@desktop/components/vaults/titlebar";
import { useStartBackup } from "@desktop/hooks/mutations/core/use-start-backup";
import { CoreFolderItem } from "@desktop/hooks/queries/core/use-folder-list";
import { useSpace } from "@desktop/hooks/queries/use-space";
import { VaultItem } from "@desktop/hooks/queries/use-vault";
import { useCreateFolderDialog } from "@desktop/hooks/state/use-create-folder-dialog";
import { useUpgradeDialog } from "@desktop/hooks/state/use-upgrade-dialog";
import { useTheme } from "@desktop/hooks/use-theme";
import { formatSize } from "@desktop/lib/number";
import { useAppTranslation } from "@hooks/use-app-translation";
import { Link } from "@tanstack/react-router";
import { Button } from "@ui/button";
import { Card, CardContent, CardTitle } from "@ui/card";
import { CircularProgress } from "@ui/circular-progress";
import { Skeleton } from "@ui/skeleton";
import { cn } from "@utils/class";
import {
  CircleFadingArrowUpIcon,
  CloudUploadIcon,
  FolderPlusIcon,
  PlusIcon,
  SettingsIcon,
} from "lucide-react";
import { useMemo } from "react";
import { GaugeComponent } from "react-gauge-component";

type VaultHomeProps = {
  vault?: VaultItem;
  folders?: CoreFolderItem[];
};

export function VaultHome({ vault, folders }: VaultHomeProps) {
  const { t } = useAppTranslation("vault.home");

  const { dark } = useTheme();
  const { openCreateFolder } = useCreateFolderDialog();
  const { openUpgradeDialog } = useUpgradeDialog();
  const { mutate: startBackup, isPending: isStartingBackup } = useStartBackup();
  const { data: space } = useSpace();

  const storagePercentage = useMemo(() => {
    if (!space) return null;
    return Math.min(space.used / space.capacity, 1);
  }, [space]);

  const isAnyBackupRunning = useMemo(
    () =>
      folders?.some(
        (folder) =>
          folder.status === "UPLOADING" || folder.status === "PENDING",
      ),
    [folders],
  );

  return (
    <>
      <div
        className={cn(
          "flex min-h-full flex-col overflow-x-hidden p-6",
          folders !== undefined ? "overflow-y-auto" : "overflow-hidden",
        )}
      >
        <VaultTitlebar
          vault={vault}
          breadcrumbs={
            !vault
              ? [undefined]
              : [
                  {
                    id: "home",
                    text: t("title"),
                  },
                ]
          }
        >
          {vault ? (
            vault.provider === "BLINKDISK_CLOUD" ? (
              <Button
                size="sm"
                variant={(storagePercentage || 0) < 0.7 ? "outline" : "default"}
                onClick={openUpgradeDialog}
              >
                <CircleFadingArrowUpIcon />

                {t("upgrade")}
              </Button>
            ) : (
              <Button
                as={Link}
                to="/app/{-$vaultId}/{-$hostName}/{-$userName}/settings"
                variant="outline"
                size="sm"
              >
                <SettingsIcon />
                {t("settings")}
              </Button>
            )
          ) : (
            <>
              <Skeleton height="2.25rem" width="7rem" />
            </>
          )}
        </VaultTitlebar>
        <div className="flex flex-row gap-6">
          <Card className="grow">
            <CardContent className="flex h-full items-center gap-7 p-6">
              {vault ? (
                <GaugeComponent
                  labels={{
                    valueLabel: { hide: true },
                    tickLabels: { hideMinMax: true },
                  }}
                  type="semicircle"
                  arc={{
                    colorArray: ["#ef4444", "#22c55e"],
                    padding: 0.05,
                    subArcs: [
                      { limit: 30 },
                      { limit: 60 },
                      { limit: 85 },
                      { limit: 100 },
                      {},
                    ],
                  }}
                  pointer={{
                    type: "needle",
                    animate: false,
                    color: dark ? "#fff" : "#000",
                  }}
                  value={100}
                  className="mx-[-2rem] mb-[-1rem] mt-[-1.25rem] w-48"
                />
              ) : (
                <Skeleton width="8rem" height="5rem" />
              )}
              <div className="flex flex-col gap-1">
                <p className="text-2xl font-bold">
                  {vault ? t("score.category") : <Skeleton width={100} />}
                </p>
                <p className="text-muted-foreground text-sm">
                  {vault ? (
                    t("score.description")
                  ) : (
                    <Skeleton width={200} count={2} />
                  )}
                </p>
              </div>
            </CardContent>
          </Card>
          {!vault || (vault && vault.provider === "BLINKDISK_CLOUD") ? (
            <>
              <Card
                className={cn(
                  "flex flex-shrink-0 items-center justify-center",
                  (storagePercentage || 0) >= 0.9
                    ? "border-destructive/20 bg-destructive/10 text-destructive [&_.muted]:text-destructive/70"
                    : (storagePercentage || 0) >= 0.8
                      ? "border-orange-600/20 bg-orange-600/10 text-orange-600 [&_.muted]:text-orange-600/70"
                      : (storagePercentage || 0) >= 0.7
                        ? "border-amber-600/20 bg-amber-600/10 text-amber-600 [&_.muted]:text-amber-600/70"
                        : "",
                )}
              >
                <CardContent className="flex w-60 flex-col justify-between p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex flex-col">
                      <CardTitle className="text-sm font-medium">
                        {vault && space ? (
                          t("usedStorage.title")
                        ) : (
                          <Skeleton width={100} />
                        )}
                      </CardTitle>
                      <p className="mt-1 text-3xl font-bold">
                        {vault && space ? (
                          storagePercentage?.toLocaleString(undefined, {
                            style: "percent",
                          }) || ""
                        ) : (
                          <Skeleton width={100} />
                        )}
                      </p>
                    </div>
                    {vault && space ? (
                      <CircularProgress
                        value={100 * (storagePercentage || 0)}
                        size={50}
                        strokeWidth={6}
                        progressClassName="opacity-60 dark:opacity-70"
                      />
                    ) : (
                      <Skeleton width={50} height={50} />
                    )}
                  </div>
                  <p className="muted text-muted-foreground mt-2 text-sm">
                    {vault && space ? (
                      t("usedStorage.amount", {
                        // Show 0B used if less than 20kb
                        // Users were confused that there was already space used after
                        // creating an empty vault. Usually a new vault takes around 8kb.
                        used: formatSize(space.used < 20000 ? 0 : space.used),
                        capacity: formatSize(space.capacity),
                      })
                    ) : (
                      <Skeleton width={160} />
                    )}
                  </p>
                </CardContent>
              </Card>
            </>
          ) : null}
        </div>
        <div className="mt-8 flex items-center justify-between">
          <div className="flex flex-col">
            <h2 className="text-xl font-semibold">
              {folders !== undefined ? (
                t("folders.title")
              ) : (
                <Skeleton width={80} />
              )}
            </h2>
            <p className="text-muted-foreground text-xs">
              {folders !== undefined ? (
                t("folders.count", { count: folders?.length })
              ) : (
                <Skeleton width={120} />
              )}
            </p>
          </div>
          <div className="flex items-center gap-3">
            {folders !== undefined ? (
              <>
                <LocalButton onClick={openCreateFolder} variant="outline">
                  <PlusIcon />
                  {t("folders.addFolder")}
                </LocalButton>
                {folders.length > 0 ? (
                  <LocalButton
                    onClick={() => startBackup({})}
                    loading={isStartingBackup || isAnyBackupRunning}
                  >
                    <CloudUploadIcon />
                    {t("folders.backupAll")}
                  </LocalButton>
                ) : null}
              </>
            ) : (
              <>
                <Skeleton width="8rem" height="2.75rem" />
                <Skeleton width="9rem" height="2.75rem" />
              </>
            )}
          </div>
        </div>
        {folders !== null && folders !== undefined && !folders.length ? (
          <Empty
            icon={<FolderPlusIcon />}
            title={t("folders.empty.title")}
            description={t("folders.empty.description")}
          >
            <LocalButton onClick={openCreateFolder} size="lg">
              <PlusIcon />
              {t("folders.addFolder")}
            </LocalButton>
          </Empty>
        ) : (
          <FolderList folders={folders} />
        )}
      </div>
    </>
  );
}
