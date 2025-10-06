import { useParams } from "@tanstack/react-router";
import { useEffect } from "react";

export function useVaultActivate() {
  const params = useParams({ strict: false });

  useEffect(() => {
    async function activate() {
      if (!params.vaultId) return;

      await window.electron.vault.activate({
        vaultId: params.vaultId,
      });
    }

    const interval = setInterval(activate, 1000);
    activate();

    return () => {
      clearInterval(interval);
    };
  }, [params]);
}
