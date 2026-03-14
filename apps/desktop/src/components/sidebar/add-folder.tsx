import { LocalButton } from "#components/vaults/local-button";
import { useVaultStatus } from "#hooks/queries/use-vault-status";
import { useCreateFolderDialog } from "#hooks/state/use-create-folder-dialog";
import { useAppTranslation } from "@hooks/use-app-translation";
import { SidebarMenuItem } from "@ui/sidebar";
import { Skeleton } from "@ui/skeleton";
import { PlusIcon } from "lucide-react";

export function SidebarAddFolder() {
  const { t } = useAppTranslation("sidebar");
  const { openCreateFolder } = useCreateFolderDialog();
  const { status } = useVaultStatus();

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
          className="bg-sidebar-secondary border-sidebar-secondary-border hover:bg-sidebar-secondary-hover w-full"
          variant="secondary"
          onClick={() => openCreateFolder()}
        >
          <PlusIcon />
          <span>{t("addFolder")}</span>
        </LocalButton>
      </SidebarMenuItem>
    );
}
