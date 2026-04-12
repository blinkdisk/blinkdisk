import { useAccountReactivity } from "@desktop/hooks/use-reactivity";
import { getConfigCollection } from "@desktop/lib/db";

export function useConfigList() {
  const data = useAccountReactivity((accountId) =>
    getConfigCollection(accountId).find({}).fetch(),
  );

  return { data };
}
