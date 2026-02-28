import { Store, useStore } from "@tanstack/react-store";
import { useCallback } from "react";

type PinBackupDialogOptions = {
  backupId: string;
  currentPins: string[];
};

const store = new Store<{
  isOpen: boolean;
  options: PinBackupDialogOptions | null;
}>({
  isOpen: false,
  options: null,
});

export function usePinBackupDialog() {
  const { isOpen, options } = useStore(store);

  const setIsOpen = useCallback((to: boolean) => {
    store.setState((state) => ({
      ...state,
      isOpen: to,
    }));
  }, []);

  function openPinBackupDialog(options: PinBackupDialogOptions) {
    store.setState({
      isOpen: true,
      options,
    });
  }

  return {
    isOpen,
    setIsOpen,
    openPinBackupDialog,
    options,
  };
}
