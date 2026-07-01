import { LOCAL_ACCOUNT_ID } from "@blinkdisk/constants/account";
import type { AccountStorageType } from "@blinkdisk/electron/store";
import { useAppStorage } from "@desktop/hooks/use-app-storage";

export function useAccountList() {
  // @ts-expect-error Accounts not typed here
  const [accountStorage] = useAppStorage("accounts") as [
    Record<string, AccountStorageType>,
  ];

  const accounts = (() => {
    if (!accountStorage) return [];

    const accounts: {
      id: string;
      name: string | undefined;
      email: string | undefined;
      createdAt: string | undefined;
    }[] = [];

    for (const [accountId, account] of Object.entries(accountStorage)) {
      if (accountId === LOCAL_ACCOUNT_ID || !account.active) continue;

      accounts.push({
        id: accountId,
        name: account.data?.name,
        email: account.data?.email,
        createdAt:
          account.data?.createdAt instanceof Date
            ? account.data.createdAt.toISOString()
            : account.data?.createdAt,
      });
    }

    return accounts.sort((a, b) => {
      if (!a.createdAt || !b.createdAt) return 0;
      return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
    });
  })();

  return { accounts };
}
