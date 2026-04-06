import { AccountStorageType, store } from "@electron/store";

export type AccountCacheWithId = AccountStorageType & {
  id: string;
};

export function getAccountCache() {
  const accounts = store.get("accounts") || {};

  return Object.entries(accounts).map(([id, account]) => ({
    id,
    ...account,
  })) as AccountCacheWithId[];
}
