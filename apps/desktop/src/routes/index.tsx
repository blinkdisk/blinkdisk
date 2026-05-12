import { LOCAL_ACCOUNT_ID } from "@blinkdisk/constants/account";
import { AccountStorageType } from "@blinkdisk/electron/store";
import { getVaultCollection } from "@desktop/lib/db";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";

export const Route = createFileRoute("/")({
  component: RouteComponent,
});

function RouteComponent() {
  const navigate = useNavigate();

  useEffect(() => {
    const hasSkippedAuth = window.electron.store.get("hasSkippedAuth") as
      | boolean
      | undefined;

    const { accounts } = window.electron.store.get(
      // @ts-expect-error accounts key does not exist
      "accounts",
    ) as Record<string, AccountStorageType>;

    const hasOnlineAccount = Object.entries(accounts || {}).some(
      ([accountId, account]) =>
        accountId !== LOCAL_ACCOUNT_ID &&
        (account as unknown as AccountStorageType)?.active,
    );

    const hasLocalVaults = getVaultCollection(LOCAL_ACCOUNT_ID)
      .find()
      .fetch().length;

    if (!hasOnlineAccount && !hasLocalVaults && !hasSkippedAuth) {
      navigate({
        to: "/welcome",
        replace: true,
      });

      return;
    }

    const accountId = window.electron.store.get("currentAccountId") as
      | string
      | undefined
      | null;

    navigate({
      to: "/{-$accountId}",
      params: { accountId: accountId || LOCAL_ACCOUNT_ID },
      replace: true,
    });
  }, [navigate]);

  return null;
}
