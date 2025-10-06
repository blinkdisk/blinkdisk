import {
  VaultBreadcrumb,
  VaultBreadcrumbProps,
} from "@desktop/components/vaults/breadcrumb";
import { VaultItem } from "@desktop/hooks/queries/use-vault";

type VaultTitlebarProps = {
  vault: VaultItem | undefined;
  breadcrumbs: VaultBreadcrumbProps["breadcrumbs"];
  children?: React.ReactNode;
};

export function VaultTitlebar({
  vault,
  breadcrumbs,
  children,
}: VaultTitlebarProps) {
  return (
    <div className="mb-6 flex h-9 w-full items-center justify-between gap-4">
      <VaultBreadcrumb vault={vault} breadcrumbs={breadcrumbs} />
      <div className="flex shrink-0 items-center gap-x-2">{children}</div>
    </div>
  );
}
