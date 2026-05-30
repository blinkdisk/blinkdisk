import { useAppTranslation } from "@blinkdisk/hooks/use-app-translation";
import { Button } from "@blinkdisk/ui/button";
import {
  DirectoryTable,
  type Item as DirectoryTableItem,
} from "@desktop/components/directories/table";
import { Empty } from "@desktop/components/empty";
import { VaultRestores } from "@desktop/components/vaults/restores";
import { useStartMount } from "@desktop/hooks/mutations/core/use-start-mount";
import { useStartRestore } from "@desktop/hooks/mutations/core/use-start-restore";
import { useDirectory } from "@desktop/hooks/queries/core/use-directory";
import { usePlatform } from "@desktop/hooks/queries/use-platform";
import { useRestoreDirectoryDialog } from "@desktop/hooks/state/use-restore-directory-dialog";
import { useBackup } from "@desktop/hooks/use-backup";
import { useDirectoryId } from "@desktop/hooks/use-directory-id";
import { useFolder } from "@desktop/hooks/use-folder";
import { createFileRoute } from "@tanstack/react-router";
import { CloudDownloadIcon, FilePlusIcon, FolderOpenIcon } from "lucide-react";
import { useCallback, useRef, useState } from "react";
import { z } from "zod";

type DirectoryTableSelection = {
  items: DirectoryTableItem[];
  allSelected: boolean;
};

export const Route = createFileRoute(
  "/{-$accountId}/{-$vaultId}/{-$hostName}/{-$userName}/{-$folderId}/{-$backupId}/{-$directoryId}/",
)({
  component: RouteComponent,
  validateSearch: z.object({
    path: z
      .object({
        objectId: z.string(),
        name: z.string(),
      })
      .array()
      .optional(),
  }),
});

function RouteComponent() {
  const scrollParent = useRef<HTMLDivElement>(null);
  const [selection, setSelection] = useState<DirectoryTableSelection>({
    items: [],
    allSelected: false,
  });

  const { t } = useAppTranslation("directory");
  const { path } = Route.useSearch();
  const { directoryId } = useDirectoryId();

  const { data: folder } = useFolder();
  const { data: backup } = useBackup();
  const { data: directory } = useDirectory();
  const { data: platform } = usePlatform();
  const { openRestoreDirectory } = useRestoreDirectoryDialog();
  const { mutate: startMount, isPending: isStartMountPending } =
    useStartMount();
  const { mutate: startRestore, isPending: isStartingRestore } =
    useStartRestore();

  const updateSelection = useCallback((selection: DirectoryTableSelection) => {
    setSelection(selection);
  }, []);

  const selectedItemCount = selection.items.length;

  return (
    <div
      ref={scrollParent}
      className="flex h-full w-full flex-col overflow-hidden p-6"
    >
      <div className="mb-6 flex h-10 w-full items-center justify-end gap-4">
        <div className="flex shrink-0 items-center gap-x-2">
          <Button
            onClick={() => startMount()}
            loading={isStartMountPending}
            variant="secondary"
          >
            <FolderOpenIcon />
            {t(
              `table.mount.open.${
                platform === "windows"
                  ? "windows"
                  : platform === "macos"
                    ? "macos"
                    : "other"
              }`,
            )}
          </Button>
          <Button
            onClick={() => {
              if (selection.items.length === 0 || selection.allSelected) {
                openRestoreDirectory({
                  directoryId: directoryId || "",
                  path,
                  folder,
                  backup,
                });
                return;
              }

              if (selection.items.length === 1 && selection.items[0]) {
                startRestore({
                  variant: "single",
                  item: selection.items[0],
                });
                return;
              }

              startRestore({
                variant: "multiple",
                items: selection.items,
              });
            }}
            loading={isStartingRestore}
          >
            <CloudDownloadIcon />
            {selectedItemCount > 0
              ? t("table.restore.selected", {
                  count: selectedItemCount,
                })
              : t("table.restore.folder")}
          </Button>
        </div>
      </div>
      <div className="flex h-[calc(100vh-8.9rem)] w-full flex-col">
        <VaultRestores />
        {directory !== null &&
        directory !== undefined &&
        directory.length === 0 ? (
          <Empty
            icon={<FilePlusIcon />}
            title={t("table.empty.title")}
            description={t("table.empty.description")}
          />
        ) : (
          <DirectoryTable
            items={
              directory !== undefined
                ? directory
                : new Array(5).fill({ name: "", skeleton: true, size: 0 })
            }
            onSelectionChange={updateSelection}
          />
        )}
      </div>
    </div>
  );
}
