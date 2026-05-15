import type { UpdateStatus } from "@blinkdisk/electron/updater";
import { Store, useStore } from "@tanstack/react-store";
import { useCallback } from "react";

type UpdateState = {
  isOpen: boolean;
  status: UpdateStatus | null;
};

const store = new Store<UpdateState>({
  isOpen: false,
  status: null,
});

export type UpdateDialogTestState =
  | "hidden"
  | "downloading"
  | "downloaded"
  | "error";

export function useUpdateDialog() {
  const { isOpen, status } = useStore(store);

  const setIsOpen = useCallback((to: boolean) => {
    store.setState((state) => ({
      ...state,
      isOpen: to,
    }));
  }, []);

  const setStatus = useCallback((to: UpdateStatus | null) => {
    store.setState((state) => ({
      ...state,
      isOpen: !!to?.available,
      status: to,
    }));
  }, []);

  return {
    isOpen,
    setIsOpen,
    status,
    setStatus,
  };
}
