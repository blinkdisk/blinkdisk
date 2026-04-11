import { AccountStorageType } from "@blinkdisk/electron/store";
import { LOCAL_ACCOUNT_ID } from "libs/constants/src/account";
import { useMemo } from "react";
import { useAppStorage } from "../use-app-storage";

export function useAccountList() {
  // @ts-expect-error Accounts not typed here
  const [accountStorage] = useAppStorage("accounts") as [
    Record<string, AccountStorageType>,
  ];

  const accounts = useMemo(() => {
    if (!accountStorage) return [];

    return Object.entries(accountStorage)
      .filter(([id, account]) => id !== LOCAL_ACCOUNT_ID && !!account.active)
      .map(([accountId, account]) => ({
        id: accountId,
        name: account.data?.name,
        email: account.data?.email,
      }));
  }, [accountStorage]);

  return { accounts };
}
