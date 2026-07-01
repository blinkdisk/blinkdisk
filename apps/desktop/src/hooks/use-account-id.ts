import { LOCAL_ACCOUNT_ID } from "@blinkdisk/constants/account";
import { useParams } from "@tanstack/react-router";

export function useAccountId() {
  const { accountId } = useParams({ strict: false });

  const isLocalAccount = !accountId ? null : accountId === LOCAL_ACCOUNT_ID;

  const isOnlineAccount = !accountId ? null : accountId !== LOCAL_ACCOUNT_ID;

  return { accountId, isLocalAccount, isOnlineAccount };
}
