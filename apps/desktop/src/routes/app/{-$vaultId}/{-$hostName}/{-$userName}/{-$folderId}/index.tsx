import { BackupProgress } from "@desktop/components/backups/progress";
import { BackupTimeline } from "@desktop/components/backups/timeline";
import { Empty } from "@desktop/components/empty";
import { FolderPreview } from "@desktop/components/folders/preview";
import { LocalButton } from "@desktop/components/vaults/local-button";
import { VaultRestores } from "@desktop/components/vaults/restores";
import { VaultTitlebar } from "@desktop/components/vaults/titlebar";
import { useCancelBackup } from "@desktop/hooks/mutations/core/use-cancel-backup";
import { useStartBackup } from "@desktop/hooks/mutations/core/use-start-backup";
import { useCompletedBackupList } from "@desktop/hooks/queries/use-completed-backup-list";
import { useVault } from "@desktop/hooks/queries/use-vault";
import { useFolderSettingsDialog } from "@desktop/hooks/state/use-folder-settings-dialog";
import { useFolder } from "@desktop/hooks/use-folder";
import { useAppTranslation } from "@hooks/use-app-translation";
import { DotLottieReact } from "@lottiefiles/dotlottie-react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { Button } from "@ui/button";
import { Skeleton } from "@ui/skeleton";
import { cn } from "@utils/class";
import {
  ArrowLeftIcon,
  ClockIcon,
  CloudUploadIcon,
  ListPlusIcon,
  SettingsIcon,
  SquareIcon,
} from "lucide-react";
import animation from "/animations/backup.lottie?url";

export const Route = createFileRoute(
  "/app/{-$vaultId}/{-$hostName}/{-$userName}/{-$folderId}/",
)({
  component: RouteComponent,
});

function RouteComponent() {
  const { t } = useAppTranslation("backup.list");

  const { data: folder } = useFolder();
  const { data: vault } = useVault();
  const { openFolderSettings } = useFolderSettingsDialog();
  const { data: backups } = useCompletedBackupList();

  const { mutate: startBackup, isPending: isStartingBackup } = useStartBackup();
  const { mutate: cancelBackup, isPending: isCancellingBackup } =
    useCancelBackup();

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
          as={Link}
          to="/app/{-$vaultId}/{-$hostName}/{-$userName}"
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
              {folder && folder.status === "UPLOADING" ? (
                <LocalButton
                  variant="outline"
                  onClick={() =>
                    folder.currentTask &&
                    cancelBackup({ taskId: folder.currentTask })
                  }
                  loading={
                    isCancellingBackup ||
                    folder?.currentTaskStatus === "CANCELING"
                  }
                >
                  <SquareIcon />
                  {t("cancel")}
                </LocalButton>
              ) : (
                <LocalButton
                  onClick={() =>
                    folder && startBackup({ path: folder.source.path })
                  }
                  loading={isStartingBackup || folder?.status === "PENDING"}
                >
                  <CloudUploadIcon />
                  {t("backup")}
                </LocalButton>
              )}
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
        folder?.status === "UPLOADING" &&
        folder.currentTaskStatus == "CANCELING" ? (
          <Empty
            icon={<SquareIcon />}
            title={t("empty.canceling.title")}
            description={t("empty.canceling.description")}
          />
        ) : folder?.status === "UPLOADING" ? (
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
              <BackupProgress upload={folder.upload} />
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
            <LocalButton
              onClick={() =>
                folder && startBackup({ path: folder.source.path })
              }
              loading={isStartingBackup}
              disabled={!folder}
              size="lg"
            >
              <CloudUploadIcon />
              {t("empty.default.button")}
            </LocalButton>
          </Empty>
        )
      ) : (
        <BackupTimeline backups={backups} />
      )}
    </div>
  );
}
