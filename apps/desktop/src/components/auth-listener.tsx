import { useAuth } from "@desktop/hooks/use-auth";
import { useNavigate } from "@tanstack/react-router";
import { useCallback, useEffect } from "react";

export function AuthListener() {
  const { setAuthenticated, accountChanged } = useAuth();
  const navigate = useNavigate();

  const onAccountAdd = useCallback(async () => {
    await setAuthenticated(true);
    await navigate({ to: "/{-$accountId}/loading" });

    const session = await accountChanged(false);
    if (!session) return navigate({ to: "/" });

    navigate({ to: "/{-$accountId}", params: { accountId: session.user.id } });
  }, [setAuthenticated, accountChanged, navigate]);

  useEffect(() => {
    return window.electron.auth.onAccountAdd(onAccountAdd);
  }, [onAccountAdd]);

  return null;
}
