import { useAccountId } from "@desktop/hooks/use-account-id";
import { useQueryClient } from "@tanstack/react-query";
import type { IpcRendererEvent } from "electron";
import { useEffect } from "react";

export function useSpaceUpdate() {
  const queryClient = useQueryClient();
  const { accountId } = useAccountId();

  useEffect(() => {
    if (!accountId) return;

    const handler = async (
      _: IpcRendererEvent,
      payload: {
        vaultId: string;
        space: {
          used: number;
          capacity: number;
        };
      },
    ) => {
      await queryClient.setQueryData(
        [accountId, "vault", payload.vaultId, "space"],
        payload.space,
      );
    };

    window.electron.space.update.on(handler);

    return () => {
      window.electron.space.update.off(handler);
    };
  }, [queryClient, accountId]);
}
