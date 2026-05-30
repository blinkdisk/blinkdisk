import { useAppTranslation } from "@blinkdisk/hooks/use-app-translation";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@blinkdisk/ui/breadcrumb";
import { Button } from "@blinkdisk/ui/button";
import { Skeleton } from "@blinkdisk/ui/skeleton";
import { DirectoryTable } from "@desktop/components/directories/table";
import { Empty } from "@desktop/components/empty";
import { VaultRestores } from "@desktop/components/vaults/restores";
import { useDirectory } from "@desktop/hooks/queries/core/use-directory";
import { useVault } from "@desktop/hooks/queries/use-vault";
import { useBackup } from "@desktop/hooks/use-backup";
import { useFolder } from "@desktop/hooks/use-folder";
import { getBackupDisplayName } from "@desktop/lib/backup";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { ArrowLeftIcon, FilePlusIcon } from "lucide-react";
import { useRef } from "react";
import { Fragment } from "react/jsx-runtime";
import { z } from "zod";

type BreadcrumbSearchParams = {
  path?: { objectId: string; name: string }[];
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
      <div className="mb-6 flex h-9 w-full items-center justify-between gap-4">
        <Breadcrumb className="w-full min-w-0 overflow-x-auto">
          <BreadcrumbList className="flex flex-nowrap whitespace-nowrap">
            <BreadcrumbItem>
              <BreadcrumbLink
                className="text-base"
                render={
                  vault ? (
                    <Link to="/{-$accountId}/{-$vaultId}/{-$hostName}/{-$userName}">
                      {vault.name}
                    </Link>
                  ) : (
                    <Skeleton width={100} />
                  )
                }
              />
            </BreadcrumbItem>
            <BreadcrumbSeparator className="[&>svg]:size-4" />
            {!folder || !backup ? (
              <>
                <BreadcrumbItem>
                  <BreadcrumbPage className="text-base">
                    <Skeleton width={100} />
                  </BreadcrumbPage>
                </BreadcrumbItem>
                <BreadcrumbSeparator className="[&>svg]:size-4" />
                <BreadcrumbItem>
                  <BreadcrumbPage className="text-base">
                    <Skeleton width={100} />
                  </BreadcrumbPage>
                </BreadcrumbItem>
              </>
            ) : (
              <>
                <BreadcrumbItem>
                  <BreadcrumbLink
                    className="text-base"
                    render={
                      <Link to="/{-$accountId}/{-$vaultId}/{-$hostName}/{-$userName}/{-$folderId}">
                        {folder.name || ""}
                      </Link>
                    }
                  />
                </BreadcrumbItem>
                <BreadcrumbSeparator className="[&>svg]:size-4" />
                <BreadcrumbItem>
                  {!path?.length ? (
                    <BreadcrumbPage className="text-base">
                      {getBackupDisplayName(backup)}
                    </BreadcrumbPage>
                  ) : (
                    <BreadcrumbLink
                      className="text-base"
                      render={
                        <Link
                          to="/{-$accountId}/{-$vaultId}/{-$hostName}/{-$userName}/{-$folderId}/{-$backupId}/{-$directoryId}"
                          params={(params) => ({
                            ...params,
                            directoryId: backup.rootID,
                          })}
                        >
                          {getBackupDisplayName(backup)}
                        </Link>
                      }
                    />
                  )}
                </BreadcrumbItem>
                {path?.map(({ objectId, name }, index) => (
                  <Fragment key={objectId}>
                    <BreadcrumbSeparator className="[&>svg]:size-4" />
                    <BreadcrumbItem>
                      {index === path.length - 1 ? (
                        <BreadcrumbPage className="text-base">
                          {name}
                        </BreadcrumbPage>
                      ) : (
                        <BreadcrumbLink
                          className="text-base"
                          render={
                            <Link
                              to="/{-$accountId}/{-$vaultId}/{-$hostName}/{-$userName}/{-$folderId}/{-$backupId}/{-$directoryId}"
                              params={(params: Record<string, string>) => ({
                                ...params,
                                directoryId: objectId,
                              })}
                              search={(search: BreadcrumbSearchParams) => ({
                                ...search,
                                path: search.path?.slice(0, index + 1),
                              })}
                            >
                              {name}
                            </Link>
                          }
                        />
                      )}
                    </BreadcrumbItem>
                  </Fragment>
                ))}
              </>
            )}
          </BreadcrumbList>
        </Breadcrumb>
        <div className="flex shrink-0 items-center gap-x-2">
          <Button
            onClick={() => {
              if (path?.length)
                navigate({
                  to: "/{-$accountId}/{-$vaultId}/{-$hostName}/{-$userName}/{-$folderId}/{-$backupId}/{-$directoryId}",
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
                  to: "/{-$accountId}/{-$vaultId}/{-$hostName}/{-$userName}/{-$folderId}",
                });
            }}
            size="sm"
            variant="outline"
          >
            <ArrowLeftIcon />
            {t("back")}
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
            path={path}
          />
        )}
      </div>
    </div>
  );
}
