import { DirectoryTable } from "@desktop/components/directories/table";
import { Empty } from "@desktop/components/empty";
import { VaultRestores } from "@desktop/components/vaults/restores";
import { VaultTitlebar } from "@desktop/components/vaults/titlebar";
import { useDirectory } from "@desktop/hooks/queries/core/use-directory";
import { useVault } from "@desktop/hooks/queries/use-vault";
import { useBackup } from "@desktop/hooks/use-backup";
import { useFolder } from "@desktop/hooks/use-folder";
import { getBackupDisplayName } from "@desktop/lib/backup";
import { useAppTranslation } from "@hooks/use-app-translation";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Button } from "@ui/button";
import { ArrowLeftIcon, FilePlusIcon } from "lucide-react";
import { useRef } from "react";
import { z } from "zod";

export const Route = createFileRoute(
  "/app/{-$vaultId}/{-$hostName}/{-$userName}/{-$folderId}/{-$backupId}/{-$directoryId}/",
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
  const navigate = useNavigate();
  const scrollParent = useRef<HTMLDivElement>(null);

  const { t } = useAppTranslation("directory");
  const { path } = Route.useSearch();

  const { data: vault } = useVault();
  const { data: folder } = useFolder();
  const { data: backup } = useBackup();
  const { data: directory } = useDirectory();

  return (
    <div
      ref={scrollParent}
      className="flex h-full w-full flex-col overflow-hidden p-6"
    >
      <VaultTitlebar
        vault={vault}
        breadcrumbs={
          !folder || !backup
            ? [undefined, undefined]
            : [
                {
                  id: "folder",
                  text: folder.name || "",
                  href: "/app/{-$vaultId}/{-$hostName}/{-$userName}/{-$folderId}/",
                },
                {
                  id: "backup",
                  text: getBackupDisplayName(backup),
                  href:
                    !path || !path.length
                      ? undefined
                      : "/app/{-$vaultId}/{-$hostName}/{-$userName}/{-$folderId}/{-$backupId}/{-$directoryId}",
                  params: (params) => ({
                    ...params,
                    directoryId: backup.rootID,
                  }),
                },
                ...(path
                  ? path.map(({ objectId, name }, index) => ({
                      id: objectId,
                      text: name,
                      href:
                        index === path.length - 1
                          ? undefined
                          : "/app/{-$vaultId}/{-$hostName}/{-$userName}/{-$folderId}/{-$backupId}/{-$directoryId}",
                      params: (params: Record<string, string>) => ({
                        ...params,
                        directoryId: objectId,
                      }),
                      search: (search: Record<string, string[]>) => ({
                        ...search,
                        path: search.path?.slice(0, index + 1),
                      }),
                    }))
                  : []),
              ]
        }
      >
        <Button
          onClick={() => {
            if (path && path.length)
              navigate({
                to: "/app/{-$vaultId}/{-$hostName}/{-$userName}/{-$folderId}/{-$backupId}/{-$directoryId}",
                params: (params) => ({
                  ...params,
                  directoryId:
                    path[path.length - 2]?.objectId || backup?.rootID,
                }),
                search: {
                  path: path.slice(0, path.length - 1),
                },
              });
            else
              navigate({
                to: "/app/{-$vaultId}/{-$hostName}/{-$userName}/{-$folderId}",
              });
          }}
          size="sm"
          variant="outline"
        >
          <ArrowLeftIcon />
          {t("back")}
        </Button>
      </VaultTitlebar>
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
            path={path}
          />
        )}
      </div>
    </div>
  );
}
