import { useNavigate, useParams } from "@tanstack/react-router";
import { useCallback } from "react";

export function useVaultId() {
  const navigate = useNavigate({ from: "/$accountId" });
  const { accountId, vaultId } = useParams({ strict: false });

  const changeVault = useCallback(
    (id: string) => {
      if (!accountId) return;

      navigate({
        to: "/$accountId/$vaultId",
        params: (params) => ({
          ...params,
          vaultId: id,
        }),
      });
    },
    [navigate, accountId],
  );

  return { vaultId, changeVault };
}
