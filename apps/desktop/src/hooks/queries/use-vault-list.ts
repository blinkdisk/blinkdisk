import { useAccountReactivity } from "@desktop/hooks/use-reactivity";
import { getVaultCollection } from "@desktop/lib/db";

export function useVaultList() {
  const data = useAccountReactivity((accountId) =>
    getVaultCollection(accountId).find({ status: "ACTIVE" }).fetch(),
  );

  return { data };
}
