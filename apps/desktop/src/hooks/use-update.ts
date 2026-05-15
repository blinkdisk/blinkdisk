import type { UpdateStatus } from "@blinkdisk/electron/updater";
import { Store, useStore } from "@tanstack/react-store";
import { useCallback } from "react";

type UpdateState = {
  status: UpdateStatus | null;
};

const store = new Store<UpdateState>({
  status: null,
});

export type UpdateDialogTestState =
  | "hidden"
  | "downloading"
  | "downloaded"
  | "error";

export function useUpdate() {
  const { status } = useStore(store);

  const setStatus = useCallback((to: UpdateStatus | null) => {
    store.setState((state) => ({
      ...state,
      status: to,
    }));
  }, []);

  return {
    status,
    setStatus,
  };
}
