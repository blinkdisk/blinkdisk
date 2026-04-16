import { LOCAL_ACCOUNT_ID } from "@blinkdisk/constants/account";
import { DEMO_ACCOUNT } from "@blinkdisk/constants/demo";
import { isDemoMode } from "@desktop/lib/demo";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";

export const Route = createFileRoute("/")({
  component: RouteComponent,
});

function RouteComponent() {
  const navigate = useNavigate();
  useEffect(() => {
    if (isDemoMode) {
      navigate({
        to: "/{-$accountId}",
        params: { accountId: DEMO_ACCOUNT.id },
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
