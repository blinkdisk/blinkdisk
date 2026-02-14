import { LocalButton } from "@desktop/components/vaults/local-button";
import { useVaultStatus } from "@desktop/hooks/queries/use-vault-status";
import { useCreateFolderDialog } from "@desktop/hooks/state/use-create-folder-dialog";
import { useAppTranslation } from "@hooks/use-app-translation";
import { SidebarMenuItem } from "@ui/sidebar";
import { Skeleton } from "@ui/skeleton";
import { PlusIcon } from "lucide-react";

export function SidebarAddFolder() {
  const { t } = useAppTranslation("sidebar");
  const { openCreateFolder } = useCreateFolderDialog();
  const { data: status } = useVaultStatus();

  if (!status) return null;
  if (status === "STARTING")
    return (
      <SidebarMenuItem>
        <Skeleton height="2.75rem" borderRadius="0.5rem" />
      </SidebarMenuItem>
    );
  if (status === "RUNNING")
    return (
      <SidebarMenuItem>
        <LocalButton
          className="bg-sidebar-muted border-sidebar-border w-full"
          variant="outline"
          onClick={() => openCreateFolder()}
        >
          <PlusIcon />
          <span>{t("addFolder")}</span>
        </LocalButton>
      </SidebarMenuItem>
    );
}
