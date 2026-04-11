import { useAccountId } from "@desktop/hooks/use-account-id";
import { LOCAL_ACCOUNT_ID } from "libs/constants/src/account";
import { useEffect } from "react";

export function useSyncListener() {
  const { accountId } = useAccountId();

  useEffect(() => {
    if (!accountId || accountId === LOCAL_ACCOUNT_ID) return;
    window.electron.sync.account(accountId);
  }, [accountId]);
}
