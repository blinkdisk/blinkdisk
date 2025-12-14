import { Store, useStore } from "@tanstack/react-store";
import { useCallback } from "react";

type DeleteBackupDialogOptions = {
  backupId: string;
};

const store = new Store<{
  isOpen: boolean;
  options: DeleteBackupDialogOptions | null;
}>({
  isOpen: false,
  options: null,
});

export function useDeleteBackupDialog() {
  const { isOpen, options } = useStore(store);

  const setIsOpen = useCallback((to: boolean) => {
    store.setState((state) => ({
      ...state,
      isOpen: to,
    }));
  }, []);

  function openDeleteBackupDialog(options: DeleteBackupDialogOptions) {
    store.setState({
      isOpen: true,
      options,
    });
  }

  return {
    isOpen,
    setIsOpen,
    openDeleteBackupDialog,
    options,
  };
}
