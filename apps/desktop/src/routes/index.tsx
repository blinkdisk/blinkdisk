import { useAccountId } from "@desktop/hooks/use-account-id";
import { useAuth } from "@desktop/hooks/use-auth";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";

export const Route = createFileRoute("/")({
  component: RouteComponent,
});

function RouteComponent() {
  const navigate = useNavigate();

  const { accountId } = useAccountId();
  const { authenticated } = useAuth();

  useEffect(() => {
    const accountId = window.electron.store.get("currentAccountId") as
      | string
      | undefined
      | null;

    if (!authenticated || !accountId) {
      navigate({ to: "/auth", replace: true });
      return;
    }

    navigate({
      to: "/{-$accountId}",
      params: { accountId },
      replace: true,
    });
  }, [navigate, authenticated, accountId]);

  return null;
}
