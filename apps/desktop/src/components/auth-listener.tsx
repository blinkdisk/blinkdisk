import { useAuth } from "@desktop/hooks/use-auth";
import { useNavigate } from "@tanstack/react-router";
import { useCallback, useEffect } from "react";

export function AuthListener() {
  const { setAuthenticated, accountChanged } = useAuth();
  const navigate = useNavigate();

  const onAccountAdd = useCallback(
    async ({ accountId }: { accountId: string }) => {
      await setAuthenticated(true);
      await navigate({ to: "/{-$accountId}/loading" });

      await accountChanged(accountId);

      navigate({ to: "/{-$accountId}", params: { accountId } });
    },
    [setAuthenticated, accountChanged, navigate],
  );

  useEffect(() => {
    return window.electron.auth.onAccountAdd(onAccountAdd);
  }, [onAccountAdd]);

  return null;
}
