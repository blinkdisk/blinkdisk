import { Store, useStore } from "@tanstack/react-store";
import { useCallback } from "react";

type MoveVaultsDialogOptions = {
  allVaults?: boolean;
  vaultIds?: string[];
  toAccountId?: string;
};

const store = new Store<{
  isOpen: boolean;
  options: MoveVaultsDialogOptions | null;
}>({
  isOpen: false,
  options: null,
});

export function useMoveVaultsDialog() {
  const { isOpen, options } = useStore(store);

  const setIsOpen = useCallback((to: boolean) => {
    store.setState((state) => ({
      ...state,
      isOpen: to,
    }));
  }, []);

  function openMoveVaultsDialog(options?: MoveVaultsDialogOptions) {
    store.setState({
      isOpen: true,
      options: options || null,
    });
  }

  return {
    isOpen,
    setIsOpen,
    openMoveVaultsDialog,
    options,
  };
}
