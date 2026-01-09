import { useNavigate, useParams } from "@tanstack/react-router";
import { useCallback } from "react";

export function useVaultId() {
  const navigate = useNavigate();
  const { vaultId } = useParams({ strict: false });

  const changeVault = useCallback(
    (id: string) => {
      navigate({
        to: "/app/{-$vaultId}",
        params: {
          vaultId: id,
        },
      });
    },
    [navigate],
  );

  return { vaultId, changeVault };
}
