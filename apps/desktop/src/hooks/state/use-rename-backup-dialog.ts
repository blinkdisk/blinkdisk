import { Store, useStore } from "@tanstack/react-store";

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

function setIsOpen(to: boolean) {
  store.setState((state) => ({
    ...state,
    isOpen: to,
  }));
}

function openRenameBackupDialog(options: RenameBackupDialogOptions) {
  store.setState(() => ({
    isOpen: true,
    options,
  }));
}

export function useRenameBackupDialog() {
  const { isOpen, options } = useStore(store);

  return {
    isOpen,
    setIsOpen,
    openRenameBackupDialog,
    options,
  };
}
