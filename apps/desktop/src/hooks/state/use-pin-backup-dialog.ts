import { Store, useStore } from "@tanstack/react-store";

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

function setIsOpen(to: boolean) {
  store.setState((state) => ({
    ...state,
    isOpen: to,
  }));
}

function openPinBackupDialog(options: PinBackupDialogOptions) {
  store.setState(() => ({
    isOpen: true,
    options,
  }));
}

export function usePinBackupDialog() {
  const { isOpen, options } = useStore(store);

  return {
    isOpen,
    setIsOpen,
    openPinBackupDialog,
    options,
  };
}
