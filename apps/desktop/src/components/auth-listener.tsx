import { LOCAL_ACCOUNT_ID } from "@blinkdisk/constants/account";
import { useMoveVaultsDialog } from "@desktop/hooks/state/use-move-vaults-dialog";
import { useAuth } from "@desktop/hooks/use-auth";
import { getVaultCollection } from "@desktop/lib/db";
import { useNavigate } from "@tanstack/react-router";
import { useCallback, useEffect } from "react";

export function AuthListener() {
  const { openMoveVaultsDialog } = useMoveVaultsDialog();
  const { setAuthenticated, accountChanged } = useAuth();
  const navigate = useNavigate();

  const onAccountAdd = useCallback(
    async ({ accountId }: { accountId: string }) => {
      await setAuthenticated(true);
      await navigate({ to: "/{-$accountId}/loading" });

      await accountChanged(accountId);

      navigate({ to: "/{-$accountId}", params: { accountId } });

      const localVaults = getVaultCollection(LOCAL_ACCOUNT_ID)
        .find({ status: "ACTIVE" })
        .fetch();

      if (localVaults.length) {
        openMoveVaultsDialog({
          allVaults: true,
          toAccountId: accountId,
        });
      }
    },
    [setAuthenticated, accountChanged, navigate, openMoveVaultsDialog],
  );

  useEffect(() => {
    return window.electron.auth.onAccountAdd(onAccountAdd);
  }, [onAccountAdd]);

  return null;
}
