import { useAccountId } from "@desktop/hooks/use-account-id";
import { useAppStorage } from "@desktop/hooks/use-app-storage";
import { AccountStorageSchema } from "@electron/store";

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

  return useAppStorage(
    // @ts-expect-error Types are wrong
    accountId ? `accounts.${accountId}.${key}` : null,
    defaultValue,
  );
}
