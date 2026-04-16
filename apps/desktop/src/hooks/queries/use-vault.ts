import { DEMO_VAULT } from "@blinkdisk/constants/demo";
import { ZVaultType } from "@blinkdisk/schemas/vault";
import { isDemoMode } from "@desktop/lib/demo";
import { useAccountReactivity } from "@desktop/hooks/use-reactivity";
import { useVaultId } from "@desktop/hooks/use-vault-id";
import { getVaultCollection } from "@desktop/lib/db";

export type VaultItem = ZVaultType;

export function useVault(vaultId?: string) {
  const { vaultId: defaultVaultId } = useVaultId();

  const data = useAccountReactivity(
    (accountId) =>
      getVaultCollection(accountId).findOne({ id: vaultId || defaultVaultId }),
    [vaultId, defaultVaultId],
  );

  if (isDemoMode) return { data: DEMO_VAULT as VaultItem };

  return { data };
}
