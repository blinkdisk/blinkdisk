import { useVaultList } from "@desktop/hooks/queries/use-vault-list";
import { VaultCard } from "../vaults/card";

export function AccountDashboard() {
  const { data: vaults } = useVaultList();

  return (
    <div className="flex min-h-full flex-col overflow-y-auto p-6">
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2 2xl:grid-cols-3 3xl:grid-cols-4">
        {vaults?.map((vault) => (
          <VaultCard key={vault.id} vault={vault} />
        ))}
      </div>
    </div>
  );
}
