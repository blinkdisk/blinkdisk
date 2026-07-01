import { LOCAL_ACCOUNT_ID } from "@blinkdisk/constants/account";
import { useAuthDialog } from "@desktop/hooks/state/use-auth-dialog";
import { useMoveVaultsDialog } from "@desktop/hooks/state/use-move-vaults-dialog";
import { useAuth } from "@desktop/hooks/use-auth";
import { getVaultCollection } from "@desktop/lib/db";
import { useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";

export function AuthListener() {
  const { completeAuthDialog } = useAuthDialog();
  const { openMoveVaultsDialog } = useMoveVaultsDialog();
  const { setAuthenticated, accountChanged } = useAuth();
  const navigate = useNavigate({ from: "/" });

  useEffect(() => {
    const onAccountAdd = async ({ accountId }: { accountId: string }) => {
      await setAuthenticated(true);
      await navigate({
        to: "/$accountId/loading",
        params: { accountId },
      });

      await accountChanged(accountId);

      navigate({ to: "/$accountId", params: { accountId } });
      completeAuthDialog(accountId);

      const localVaults = getVaultCollection(LOCAL_ACCOUNT_ID)
        .find({ status: "ACTIVE" })
        .fetch();

      if (localVaults.length) {
        openMoveVaultsDialog({
          allVaults: true,
          toAccountId: accountId,
        });
      }
    };

    return window.electron.auth.onAccountAdd(onAccountAdd);
  }, [
    accountChanged,
    completeAuthDialog,
    navigate,
    openMoveVaultsDialog,
    setAuthenticated,
  ]);

  return null;
}
