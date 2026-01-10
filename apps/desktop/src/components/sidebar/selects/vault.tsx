import { useVaultList } from "@desktop/hooks/queries/use-vault-list";
import { useCreateVaultDialog } from "@desktop/hooks/state/use-create-vault-dialog";
import { useVaultId } from "@desktop/hooks/use-vault-id";
import { useAppTranslation } from "@hooks/use-app-translation";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectSeparator,
  SelectTrigger,
  SelectValue,
} from "@ui/select";
import { cn } from "@utils/class";
import { PlusIcon, VaultIcon } from "lucide-react";

type SidebarVaultSelectProps = {
  className?: string;
};

export function SidebarVaultSelect({ className }: SidebarVaultSelectProps) {
  const { t } = useAppTranslation("sidebar.selectVault");

  const { data: vaults } = useVaultList();
  const { vaultId, changeVault } = useVaultId();

  const { openCreateVault } = useCreateVaultDialog();

  return (
    <Select
      // The fallback prevents it from being uncontrolled
      value={vaultId || "-"}
      onValueChange={(value) =>
        value === "ADD" ? openCreateVault() : changeVault(value)
      }
    >
      <SelectTrigger
        className={cn(
          "bg-sidebar-muted border-sidebar-border focus:z-10",
          className,
        )}
      >
        <div className="flex items-center gap-2.5 truncate">
          <VaultIcon className="size-4.25 shrink-0" />
          <SelectValue placeholder={t("empty")} />
        </div>
      </SelectTrigger>
      <SelectContent>
        <SelectGroup>
          {vaults?.map((vault) => (
            <SelectItem key={vault.id} value={vault.id}>
              {vault.name}
            </SelectItem>
          ))}
        </SelectGroup>
        <SelectSeparator className="bg-border" />
        <SelectGroup>
          <SelectItem className="relative" value="ADD">
            <PlusIcon className="absolute left-2 top-1/2 size-4 -translate-y-1/2" />
            {t("createVault")}
          </SelectItem>
        </SelectGroup>
      </SelectContent>
    </Select>
  );
}
