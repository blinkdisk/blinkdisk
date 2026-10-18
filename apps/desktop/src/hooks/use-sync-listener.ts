import { LOCAL_ACCOUNT_ID } from "@blinkdisk/constants/account";
import { getErrorCode } from "@blinkdisk/utils/error";
import { useAccountId } from "@desktop/hooks/use-account-id";
import { usePostHog } from "posthog-js/react";
import { useEffect } from "react";

export function useSyncListener() {
  const { accountId } = useAccountId();
  const posthog = usePostHog();

  useEffect(() => {
    if (!accountId || accountId === LOCAL_ACCOUNT_ID) return;
    void window.electron.sync.account(accountId).catch((error: unknown) => {
      posthog.capture("account_sync_failed", {
        source: "background",
        reason: getErrorCode(error) ?? "UNKNOWN",
      });
    });
  }, [accountId, posthog]);
}
