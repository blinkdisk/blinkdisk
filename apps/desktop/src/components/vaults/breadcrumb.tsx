import { VaultItem } from "@desktop/hooks/queries/use-vault";
import { Link } from "@tanstack/react-router";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@ui/breadcrumb";
import { Skeleton } from "@ui/skeleton";
import { Fragment } from "react/jsx-runtime";

export type VaultBreadcrumbProps = {
  vault: VaultItem | undefined;
  breadcrumbs?: (
    | {
        id: string;
        text: string;
        href?: string;
        params?: (params: Record<string, string>) => Record<string, string>;
        // eslint-disable-next-line
        search?: (search: Record<string, any>) => Record<string, any>;
      }
    | undefined
  )[];
};

export function VaultBreadcrumb({ vault, breadcrumbs }: VaultBreadcrumbProps) {
  return (
    <Breadcrumb className="w-full min-w-0 overflow-x-auto">
      <BreadcrumbList className="flex flex-nowrap whitespace-nowrap">
        <BreadcrumbItem>
          <BreadcrumbLink className="text-base" asChild>
            {vault ? (
              <Link to="/app/{-$deviceId}/{-$profileId}/{-$vaultId}">
                {vault.name}
              </Link>
            ) : (
              <Skeleton width={100} />
            )}
          </BreadcrumbLink>
        </BreadcrumbItem>
        {breadcrumbs?.length ? (
          <BreadcrumbSeparator className="[&>svg]:size-4" />
        ) : null}
        {breadcrumbs?.map((item, index) => (
          <Fragment key={item?.id || index}>
            {!item ? (
              <BreadcrumbItem>
                <BreadcrumbPage className="text-base">
                  <Skeleton width={100} />
                </BreadcrumbPage>
              </BreadcrumbItem>
            ) : item.href ? (
              <BreadcrumbItem>
                <BreadcrumbLink className="text-base" asChild>
                  <Link
                    to={item.href}
                    params={item.params}
                    search={item.search}
                  >
                    {item.text}
                  </Link>
                </BreadcrumbLink>
              </BreadcrumbItem>
            ) : (
              <BreadcrumbItem>
                <BreadcrumbPage className="text-base">
                  {item.text}
                </BreadcrumbPage>
              </BreadcrumbItem>
            )}
            {index < breadcrumbs.length - 1 ? (
              <BreadcrumbSeparator className="[&>svg]:size-4" />
            ) : null}
          </Fragment>
        ))}
      </BreadcrumbList>
    </Breadcrumb>
  );
}
