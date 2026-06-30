import { Store, useStore } from "@tanstack/react-store";

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

function setIsOpen(to: boolean) {
  store.setState((state) => ({
    ...state,
    isOpen: to,
  }));
}

function openDeleteBackupDialog(options: DeleteBackupDialogOptions) {
  store.setState(() => ({
    isOpen: true,
    options,
  }));
}

export function useDeleteBackupDialog() {
  const { isOpen, options } = useStore(store);

  return {
    isOpen,
    setIsOpen,
    openDeleteBackupDialog,
    options,
  };
}
