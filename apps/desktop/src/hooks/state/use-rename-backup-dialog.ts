import { Store, useStore } from "@tanstack/react-store";
import { useCallback } from "react";

type RenameBackupDialogOptions = {
  backupId: string;
  currentName: string;
};

const store = new Store<{
  isOpen: boolean;
  options: RenameBackupDialogOptions | null;
}>({
  isOpen: false,
  options: null,
});

export function useRenameBackupDialog() {
  const { isOpen, options } = useStore(store);

  const setIsOpen = useCallback((to: boolean) => {
    store.setState((state) => ({
      ...state,
      isOpen: to,
    }));
  }, []);

  function openRenameBackupDialog(options: RenameBackupDialogOptions) {
    store.setState({
      isOpen: true,
      options,
    });
  }

  return {
    isOpen,
    setIsOpen,
    openRenameBackupDialog,
    options,
  };
}
