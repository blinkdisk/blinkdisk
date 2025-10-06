import { useAccountId } from "@desktop/hooks/use-account-id";
import { AccountStorageSchema } from "@electron/store";
import { StorageEventManager } from "@hooks/storage-event-manager";
import { useCallback, useEffect, useState } from "react";

const getStorageValue = <K extends keyof AccountStorageSchema>(
  accountId: string | null | undefined,
  key: K,
  defaultValue?: AccountStorageSchema[K],
): AccountStorageSchema[K] | undefined => {
  if (!accountId) return defaultValue;
  if (typeof window === "undefined") return defaultValue;

  return (
    (window.electron!.store.get(`accounts.${accountId}.${key}`) as
      | AccountStorageSchema[K]
      | undefined) || defaultValue
  );
};

const setStorageValue = <K extends keyof AccountStorageSchema>(
  accountId: string | null | undefined,
  key: K,
  value: AccountStorageSchema[K],
): void => {
  if (!accountId) return;
  if (typeof window === "undefined") return;

  window.electron!.store.set(`accounts.${accountId}.${key}`, value);
};

export function useAccountStorage<K extends keyof AccountStorageSchema>(
  key: K,
): [
  AccountStorageSchema[K] | undefined,
  (value: AccountStorageSchema[K]) => void,
];
export function useAccountStorage<K extends keyof AccountStorageSchema>(
  key: K,
  defaultValue: AccountStorageSchema[K],
): [AccountStorageSchema[K], (value: AccountStorageSchema[K]) => void];
export function useAccountStorage<K extends keyof AccountStorageSchema>(
  key: K,
  defaultValue?: AccountStorageSchema[K],
) {
  const { accountId } = useAccountId();

  const [state, setState] = useState<AccountStorageSchema[K] | undefined>(
    getStorageValue(accountId, key, defaultValue),
  );

  useEffect(() => {
    if (typeof window === "undefined") return;

    setState(getStorageValue(accountId, key, defaultValue));

    const unsubscribe = StorageEventManager.subscribe(() => {
      setState(getStorageValue(accountId, key, defaultValue));
    });

    return () => {
      unsubscribe();
    };
  }, [key, defaultValue, accountId]);

  const updateState = useCallback(
    (state: AccountStorageSchema[K]) => {
      if (state !== undefined) setStorageValue(accountId, key, state);
      setState(state);
    },
    [setState, accountId, key],
  );

  return [state, updateState];
}
