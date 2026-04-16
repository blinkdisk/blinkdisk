import { DEMO_VAULT } from "@blinkdisk/constants/demo";
import { isDemoMode } from "@desktop/lib/demo";
import { useAccountReactivity } from "@desktop/hooks/use-reactivity";
import { getVaultCollection } from "@desktop/lib/db";

export function useVaultList() {
  const data = useAccountReactivity((accountId) =>
    getVaultCollection(accountId).find({ status: "ACTIVE" }).fetch(),
  );

  if (isDemoMode) return { data: [DEMO_VAULT] as typeof data };

  return { data };
}
