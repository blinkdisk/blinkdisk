import { LOCAL_ACCOUNT_ID } from "@blinkdisk/constants/account";
import { DEMO_ACCOUNT } from "@blinkdisk/constants/demo";
import { AccountStorageType } from "@blinkdisk/electron/store";
import { isDemoMode } from "@desktop/lib/demo";
import { useAppStorage } from "@desktop/hooks/use-app-storage";
import { useMemo } from "react";

export function useAccountList() {
  // @ts-expect-error Accounts not typed here
  const [accountStorage] = useAppStorage("accounts") as [
    Record<string, AccountStorageType>,
  ];

  const accounts = useMemo(() => {
    if (isDemoMode) {
      return [
        {
          id: DEMO_ACCOUNT.id,
          name: DEMO_ACCOUNT.name,
          email: DEMO_ACCOUNT.email,
          createdAt: "2025-01-15T10:00:00.000Z",
        },
      ];
    }

    if (!accountStorage) return [];

    return Object.entries(accountStorage)
      .filter(([id, account]) => id !== LOCAL_ACCOUNT_ID && !!account.active)
      .map(([accountId, account]) => ({
        id: accountId,
        name: account.data?.name,
        email: account.data?.email,
        createdAt: account.data?.createdAt,
      }))
      .sort((a, b) => {
        if (!a.createdAt || !b.createdAt) return 0;
        return (
          new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
        );
      });
  }, [accountStorage]);

  return { accounts };
}
