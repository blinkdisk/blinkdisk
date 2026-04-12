import { getConfigCollection } from "@desktop/lib/db";
import { useAccountReactivity } from "../use-reactivity";

export function useConfigList() {
  const data = useAccountReactivity((accountId) =>
    getConfigCollection(accountId).find({}).fetch(),
  );

  return { data };
}
