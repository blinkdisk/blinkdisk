import { LOCAL_ACCOUNT_ID } from "@blinkdisk/constants/account";
import { useParams } from "@tanstack/react-router";
import { useMemo } from "react";

export function useAccountId() {
  const { accountId } = useParams({ strict: false });

  const isLocalAccount = useMemo(
    () => (!accountId ? null : accountId === LOCAL_ACCOUNT_ID),
    [accountId],
  );

  const isOnlineAccount = useMemo(
    () => (!accountId ? null : accountId !== LOCAL_ACCOUNT_ID),
    [accountId],
  );

  return { accountId, isLocalAccount, isOnlineAccount };
}
