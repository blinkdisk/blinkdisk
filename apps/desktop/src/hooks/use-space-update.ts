import { useQueryKey } from "@desktop/hooks/use-query-key";
import { useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";

export function useSpaceUpdate() {
  const queryClient = useQueryClient();
  const { queryKeys } = useQueryKey();

  useEffect(() => {
    return window.electron.space.update(async (payload) => {
      await queryClient.setQueryData(queryKeys.space, payload.space);
    });
  }, [queryClient, queryKeys]);
}
