import { Store, useStore } from "@tanstack/react-store";
import { useCallback } from "react";

type DeleteVaultDialogOptions = {
  vaultId: string;
};

const store = new Store<{
  isOpen: boolean;
  options: DeleteVaultDialogOptions | null;
}>({
  isOpen: false,
  options: null,
});

export function useDeleteVaultDialog() {
  const { isOpen, options } = useStore(store);

  const setIsOpen = useCallback((to: boolean) => {
    store.setState((state) => ({
      ...state,
      isOpen: to,
    }));
  }, []);

  function openDeleteVaultDialog(options: DeleteVaultDialogOptions) {
    store.setState({
      isOpen: true,
      options,
    });
  }

  return {
    isOpen,
    setIsOpen,
    openDeleteVaultDialog,
    options,
  };
}
