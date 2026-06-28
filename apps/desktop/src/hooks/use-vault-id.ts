import { useNavigate, useParams } from "@tanstack/react-router";
import { useCallback } from "react";

export function useVaultId() {
  const navigate = useNavigate();
  const { accountId, vaultId } = useParams({ strict: false });

  const changeVault = useCallback(
    (id: string) => {
      if (!accountId) return;

      navigate({
        to: "/$accountId/$vaultId",
        params: {
          accountId,
          vaultId: id,
        },
      });
    },
    [navigate, accountId],
  );

  return { vaultId, changeVault };
}
