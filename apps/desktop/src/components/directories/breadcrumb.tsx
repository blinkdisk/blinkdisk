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
import { useBackup } from "@desktop/hooks/use-backup";
import { useFolder } from "@desktop/hooks/use-folder";
import { Link, useSearch } from "@tanstack/react-router";
import { ArrowLeftIcon } from "lucide-react";
import { Fragment } from "react/jsx-runtime";

type BreadcrumbSearchParams = {
  path?: { objectId: string; name: string }[];
};

export function useDirectoryBreadcrumbPath() {
  const { path } = useSearch({
    strict: false,
  }) as BreadcrumbSearchParams;

  return path;
}

export function DirectoryBreadcrumb() {
  const path = useDirectoryBreadcrumbPath();
  const { data: folder } = useFolder();
  const { data: backup } = useBackup();

  if (!path?.length) {
    return null;
  }

  const parentPath = path.slice(0, -1);
  const parentDirectoryId =
    parentPath.length > 0
      ? parentPath[parentPath.length - 1]?.objectId
      : backup?.rootID;
  const folderName = folder?.name || folder?.source.path || "";

  return (
    <div className="mt-6 flex items-center justify-between gap-4">
      <Breadcrumb className="min-w-0 overflow-x-auto">
        <BreadcrumbList className="flex flex-nowrap whitespace-nowrap">
          {!folder || !backup ? (
            <BreadcrumbItem>
              <BreadcrumbPage className="text-base">
                <Skeleton width={100} />
              </BreadcrumbPage>
            </BreadcrumbItem>
          ) : (
            <>
              <BreadcrumbItem>
                <BreadcrumbLink
                  className="text-base"
                  render={
                    <Link
                      to="/{-$accountId}/{-$vaultId}/{-$hostName}/{-$userName}/{-$folderId}/{-$backupId}/{-$directoryId}"
                      params={(params) => ({
                        ...params,
                        directoryId: backup.rootID,
                      })}
                      search={(search: BreadcrumbSearchParams) => ({
                        ...search,
                        path: undefined,
                      })}
                    >
                      {folderName}
                    </Link>
                  }
                />
              </BreadcrumbItem>
              {path.map(({ objectId, name }, index) => (
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
      {backup && parentDirectoryId ? (
        <Button
          variant="secondary"
          size="sm"
          aria-label="Go to parent folder"
          className="shrink-0"
          render={
            <Link
              to="/{-$accountId}/{-$vaultId}/{-$hostName}/{-$userName}/{-$folderId}/{-$backupId}/{-$directoryId}"
              params={(params: Record<string, string>) => ({
                ...params,
                directoryId: parentDirectoryId,
              })}
              search={(search: BreadcrumbSearchParams) => ({
                ...search,
                path: parentPath.length > 0 ? parentPath : undefined,
              })}
            />
          }
        >
          <ArrowLeftIcon />
          Back
        </Button>
      ) : null}
    </div>
  );
}
