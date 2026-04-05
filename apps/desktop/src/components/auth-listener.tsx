import { useAuth } from "@desktop/hooks/use-auth";
import { useNavigate } from "@tanstack/react-router";
import { useCallback, useEffect } from "react";

export function AuthListener() {
  const { setAuthenticated, accountChanged } = useAuth();
  const navigate = useNavigate();

  const onAccountChange = useCallback(async () => {
    await setAuthenticated(true);
    await navigate({ to: "/{-$accountId}/loading" });

    const session = await accountChanged();
    if (!session) return navigate({ to: "/" });

    navigate({ to: "/{-$accountId}", params: { accountId: session.user.id } });
  }, [setAuthenticated, accountChanged, navigate]);

  useEffect(() => {
    return window.electron.auth.onAccountChange(onAccountChange);
  }, [onAccountChange]);

  return null;
}
