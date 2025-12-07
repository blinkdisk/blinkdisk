import { BackupProgress } from "@desktop/components/backups/progress";
import { BackupTimeline } from "@desktop/components/backups/timeline";
import { Empty } from "@desktop/components/empty";
import { FolderPreview } from "@desktop/components/folders/preview";
import { MutatingButton } from "@desktop/components/vaults/mutating-button";
import { VaultRestores } from "@desktop/components/vaults/restores";
import { VaultTitlebar } from "@desktop/components/vaults/titlebar";
import { useBackupFolder } from "@desktop/hooks/mutations/core/use-backup-folder";
import { useCompletedBackupList } from "@desktop/hooks/queries/use-completed-backup-list";
import { useVault } from "@desktop/hooks/queries/use-vault";
import { useFolderSettingsDialog } from "@desktop/hooks/state/use-folder-settings-dialog";
import { useFolder } from "@desktop/hooks/use-folder";
import { useAppTranslation } from "@hooks/use-app-translation";
import { DotLottieReact } from "@lottiefiles/dotlottie-react";
import { createFileRoute } from "@tanstack/react-router";
import { Button } from "@ui/button";
import { Skeleton } from "@ui/skeleton";
import { cn } from "@utils/class";
import {
  ArrowLeftIcon,
  ClockIcon,
  CloudUploadIcon,
  ListPlusIcon,
  SettingsIcon,
} from "lucide-react";
import animation from "/animations/backup.lottie?url";

export const Route = createFileRoute(
  "/app/{-$deviceId}/{-$profileId}/{-$vaultId}/{-$folderId}/",
)({
  component: RouteComponent,
});

function RouteComponent() {
  const { t } = useAppTranslation("backup.list");

  const { data: folder } = useFolder();
  const { data: vault } = useVault();
  const { openFolderSettings } = useFolderSettingsDialog();
  const { mutate: backup, isPending: isBackupLoading } = useBackupFolder();
  const { data: backups } = useCompletedBackupList();

  return (
    <div
      className={cn(
        "flex min-h-full flex-col overflow-x-hidden p-6",
        backups !== undefined && backups !== null
          ? "overflow-y-auto"
          : "overflow-hidden",
      )}
    >
      <VaultTitlebar
        vault={vault}
        breadcrumbs={
          !folder
            ? [undefined]
            : [
                {
                  id: "folder",
                  text: folder.name || "",
                },
              ]
        }
      >
        <Button
          as="link"
          href="/app/{-$deviceId}/{-$profileId}/{-$vaultId}"
          variant="outline"
          size="sm"
        >
          <ArrowLeftIcon />
          {t("back")}
        </Button>
      </VaultTitlebar>
      <VaultRestores />
      <div className="mb-8 flex items-center justify-between">
        <FolderPreview folder={folder} />
        <div className="flex items-center gap-2">
          {backups !== null && backups !== undefined ? (
            <>
              <Button
                variant="outline"
                onClick={() =>
                  folder &&
                  openFolderSettings({
                    folderId: folder?.id,
                  })
                }
              >
                <SettingsIcon />
                {t("settings")}
              </Button>
              <MutatingButton
                onClick={() => folder && backup({ path: folder.source.path })}
                loading={
                  isBackupLoading ||
                  ["UPLOADING", "PENDING"].includes(folder?.status || "")
                }
              >
                <CloudUploadIcon />
                {t("backup")}
              </MutatingButton>
            </>
          ) : (
            <>
              <Skeleton width="10rem" height="2.75rem" />
              <Skeleton width="9rem" height="2.75rem" />
            </>
          )}
        </div>
      </div>
      {backups !== null && backups !== undefined && backups.length === 0 ? (
        folder?.status === "UPLOADING" ? (
          <div className="flex h-full w-full flex-col items-center justify-center">
            <div className="mt-auto"></div>
            <DotLottieReact src={animation} autoplay loop className="h-34" />
            <h1 className="mt-2 whitespace-pre-wrap text-center text-3xl font-bold">
              {t("empty.initial.title")}
            </h1>
            <p className="text-muted-foreground mt-4 max-w-sm text-center text-sm">
              {t("empty.initial.description")}
            </p>
            <div className="mt-10">
              <BackupProgress upload={folder.upload} variant="big" />
            </div>
            <div className="mb-auto"></div>
          </div>
        ) : folder?.status === "PENDING" ? (
          <Empty
            icon={<ClockIcon />}
            title={t("empty.pending.title")}
            description={t("empty.pending.description")}
          />
        ) : (
          <Empty
            icon={<ListPlusIcon />}
            title={t("empty.default.title")}
            description={t("empty.default.description")}
          >
            <MutatingButton
              onClick={() => folder && backup({ path: folder.source.path })}
              loading={isBackupLoading}
              disabled={!folder}
              size="lg"
            >
              <CloudUploadIcon />
              {t("empty.default.button")}
            </MutatingButton>
          </Empty>
        )
      ) : (
        <BackupTimeline backups={backups} />
      )}
    </div>
  );
}
