import { useAppTranslation } from "@blinkdisk/hooks/use-app-translation";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@blinkdisk/ui/dropdown-menu";
import { VaultPreview } from "@desktop/components/vaults/preview";
import { useVaultList } from "@desktop/hooks/queries/use-vault-list";
import { useCreateVaultDialog } from "@desktop/hooks/state/use-create-vault-dialog";
import { useVaultId } from "@desktop/hooks/use-vault-id";
import { PlusIcon } from "lucide-react";
import type { ReactElement } from "react";

export type VaultMenuDropdownProps = {
  children: ReactElement;
};

export function VaultMenuDropdown({ children }: VaultMenuDropdownProps) {
  const { t } = useAppTranslation("sidebar");

  const { vaultId, changeVault } = useVaultId();
  const { data: vaults } = useVaultList();
  const { openCreateVault } = useCreateVaultDialog();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger render={children} />
      <DropdownMenuContent
        className="min-w-56 rounded-lg"
        side="bottom"
        align="start"
      >
        {vaults?.length ? (
          <>
            <DropdownMenuGroup>
              {vaults.map((vault) => (
                <DropdownMenuItem
                  key={vault.id}
                  onClick={() => vault.id !== vaultId && changeVault(vault.id)}
                >
                  <VaultPreview vault={vault} />
                </DropdownMenuItem>
              ))}
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
          </>
        ) : null}
        <DropdownMenuItem onClick={() => openCreateVault()}>
          <PlusIcon />
          {t("vaultMenu.createVault")}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
