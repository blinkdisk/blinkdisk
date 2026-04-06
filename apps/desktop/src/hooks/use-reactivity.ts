import { useAccountId } from "@desktop/hooks/use-account-id";
import { effect } from "@maverick-js/signals";
import { createUseReactivityHook } from "@signaldb/react";
import { DependencyList } from "react";

const useReactivity = createUseReactivityHook(effect);

export function useAccountReactivity<T>(
  reactiveFunction: (accountId: string | undefined) => T,
  deps?: DependencyList,
) {
  const { accountId } = useAccountId();

  return useReactivity(
    () => reactiveFunction(accountId),
    [accountId, ...(deps ?? [])],
  );
}
