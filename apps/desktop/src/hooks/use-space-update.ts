import { useAccountId } from "@desktop/hooks/use-account-id";
import { useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";

export function useSpaceUpdate() {
  const queryClient = useQueryClient();
  const { accountId } = useAccountId();

  useEffect(() => {
    if (!accountId) return;

    return window.electron.space.update(async (payload) => {
      await queryClient.setQueryData(
        [accountId, "vault", payload.vaultId, "space"],
        payload.space,
      );
    });
  }, [queryClient, accountId]);
}
