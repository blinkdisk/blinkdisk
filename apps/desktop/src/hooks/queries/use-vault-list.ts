import { getVaultCollection } from "@desktop/lib/db";
import { useAccountReactivity } from "../use-reactivity";

export function useVaultList() {
  const data = useAccountReactivity((accountId) =>
    getVaultCollection(accountId).find({ status: "ACTIVE" }).fetch(),
  );

  return { data };
}
