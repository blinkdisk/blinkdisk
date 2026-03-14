import { useVaultList } from "#hooks/queries/use-vault-list";
import { useCreateVaultDialog } from "#hooks/state/use-create-vault-dialog";
import { useVaultId } from "#hooks/use-vault-id";
import { useAppTranslation } from "@blinkdisk/hooks/use-app-translation";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@blinkdisk/ui/dropdown-menu";
import { cn } from "@blinkdisk/utils/class";
import { ChevronDownIcon, PlusIcon, VaultIcon } from "lucide-react";

type SidebarVaultSelectProps = {
  className?: string;
};

export function SidebarVaultSelect({ className }: SidebarVaultSelectProps) {
  const { t } = useAppTranslation("sidebar.selectVault");

  const { data: vaults } = useVaultList();
  const { vaultId, changeVault } = useVaultId();

  const { openCreateVault } = useCreateVaultDialog();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        className={cn(
          "border-input bg-sidebar-secondary hover:bg-sidebar-secondary-hover border-sidebar-secondary-border flex h-11 w-full select-none items-center justify-between gap-1.5 whitespace-nowrap rounded-lg border px-3 py-2 text-sm outline-none transition-colors focus:z-10",
          className,
        )}
      >
        <div className="flex items-center gap-2.5 truncate">
          <VaultIcon className="size-4.25 shrink-0" />
          <span className="truncate">
            {vaults?.find((v) => v.id === vaultId)?.name || t("empty")}
          </span>
        </div>
        <ChevronDownIcon className="text-muted-foreground pointer-events-none size-4 shrink-0" />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start">
        <DropdownMenuGroup>
          {vaults?.map((vault) => (
            <DropdownMenuItem
              key={vault.id}
              onClick={() => changeVault(vault.id)}
            >
              {vault.name}
            </DropdownMenuItem>
          ))}
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuItem onClick={openCreateVault}>
            <PlusIcon className="size-4" />
            {t("createVault")}
          </DropdownMenuItem>
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
